import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ReqMeta } from '../audit/request-meta.js';
import { bool, body, date, has, imageUrl, int, linkUrl, str } from '../common/validate.js';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const LOCATIONS = ['NAVBAR', 'FOOTER'];

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private log(adminId: string, meta: ReqMeta, summary: string, details?: Record<string, unknown>) {
    return this.audit.log({ userId: adminId, actorId: adminId, actorRole: 'ADMIN', action: 'ADMIN_CONTENT_CHANGED', summary, details: details ?? null, ...meta });
  }

  private async unique<T>(fn: () => Promise<T>, what: string): Promise<T> {
    try {
      return await fn();
    } catch (e: any) {
      if (e?.code === 'P2002') throw new BadRequestException('That ' + what + ' is already used');
      if (e?.code === 'P2025') throw new NotFoundException('Not found');
      throw e;
    }
  }

  // ================= Public =================
  publicCategories() {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }], select: { id: true, nameEn: true, nameSw: true, imageUrl: true } });
  }

  publicBanners() {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: { isActive: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gt: now } }] }] },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, title: true, subtitle: true, imageUrl: true, linkUrl: true },
    });
  }

  async publicMenu() {
    const rows = await this.prisma.menuItem.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
    const build = (loc: string) =>
      rows.filter((r) => r.location === loc && !r.parentId).map((r) => ({
        id: r.id, labelEn: r.labelEn, labelSw: r.labelSw, href: r.href,
        children: rows.filter((c) => c.parentId === r.id).map((c) => ({ id: c.id, labelEn: c.labelEn, labelSw: c.labelSw, href: c.href })),
      }));
    return { navbar: build('NAVBAR'), footer: build('FOOTER') };
  }

  publicPages() {
    return this.prisma.sitePage.findMany({ where: { isPublished: true }, orderBy: { titleEn: 'asc' }, select: { slug: true, titleEn: true, titleSw: true } });
  }

  async publicPage(slug: string) {
    const p = await this.prisma.sitePage.findFirst({ where: { slug, isPublished: true }, select: { slug: true, titleEn: true, titleSw: true, bodyEn: true, bodySw: true, updatedAt: true } });
    if (!p) throw new NotFoundException('Page not found');
    return p;
  }

  // ================= Categories =================
  async adminCategories() {
    const [cats, used] = await Promise.all([
      this.prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }] }),
      this.prisma.product.groupBy({ by: ['category'], where: { status: { not: 'TRASHED' } }, _count: { _all: true } }),
    ]);
    return cats.map((c) => ({ ...c, products: used.find((u) => u.category === c.nameEn)?._count._all ?? 0 }));
  }

  async createCategory(input: unknown, adminId: string, meta: ReqMeta) {
    const b = body(input);
    const nameEn = str(b.nameEn, { max: 60, required: true, label: 'English name' })!;
    const max = await this.prisma.category.aggregate({ _max: { sortOrder: true } });
    const row = await this.unique(
      () => this.prisma.category.create({ data: { nameEn, nameSw: str(b.nameSw, { max: 60, label: 'Swahili name' }), imageUrl: imageUrl(b.imageUrl, 'Picture', false), sortOrder: has(b, 'sortOrder') ? int(b.sortOrder, 'Order') : (max._max.sortOrder ?? 0) + 1, isActive: has(b, 'isActive') ? bool(b.isActive, 'Active') : true } }),
      'category name',
    );
    await this.log(adminId, meta, 'Added category "' + row.nameEn + '"');
    return row;
  }

  async updateCategory(id: string, input: unknown, adminId: string, meta: ReqMeta) {
    const b = body(input);
    const old = await this.prisma.category.findUnique({ where: { id } });
    if (!old) throw new NotFoundException('Category not found');
    const data: Record<string, unknown> = {};
    if (has(b, 'nameEn')) data.nameEn = str(b.nameEn, { max: 60, required: true, label: 'English name' });
    if (has(b, 'nameSw')) data.nameSw = str(b.nameSw, { max: 60, label: 'Swahili name' });
    if (has(b, 'imageUrl')) data.imageUrl = imageUrl(b.imageUrl, 'Picture', false);
    if (has(b, 'sortOrder')) data.sortOrder = int(b.sortOrder, 'Order');
    if (has(b, 'isActive')) data.isActive = bool(b.isActive, 'Active');
    const renamed = typeof data.nameEn === 'string' && data.nameEn !== old.nameEn;
    const row = await this.unique(async () => {
      if (!renamed) return this.prisma.category.update({ where: { id }, data });
      // products keep their category by name, so a rename moves them with it
      const [updated] = await this.prisma.$transaction([this.prisma.category.update({ where: { id }, data }), this.prisma.product.updateMany({ where: { category: old.nameEn }, data: { category: data.nameEn as string } })]);
      return updated;
    }, 'category name');
    await this.log(adminId, meta, renamed ? 'Renamed category "' + old.nameEn + '" to "' + row.nameEn + '"' : 'Updated category "' + row.nameEn + '"', { fields: Object.keys(data) });
    return row;
  }

  async deleteCategory(id: string, adminId: string, meta: ReqMeta) {
    const c = await this.prisma.category.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Category not found');
    const n = await this.prisma.product.count({ where: { category: c.nameEn } });
    if (n > 0) throw new BadRequestException(n + ' product' + (n === 1 ? ' uses' : 's use') + ' this category. Turn it off instead, so products keep it but sellers cannot pick it for new ones.');
    await this.prisma.category.delete({ where: { id } });
    await this.log(adminId, meta, 'Deleted category "' + c.nameEn + '"');
    return { ok: true };
  }

  // ================= Banners =================
  adminBanners() {
    return this.prisma.banner.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  }

  async createBanner(input: unknown, adminId: string, meta: ReqMeta) {
    const b = body(input);
    const startsAt = date(b.startsAt, 'Start date');
    const endsAt = date(b.endsAt, 'End date');
    if (startsAt && endsAt && endsAt <= startsAt) throw new BadRequestException('End date must be after the start date');
    const max = await this.prisma.banner.aggregate({ _max: { sortOrder: true } });
    const row = await this.prisma.banner.create({
      data: { imageUrl: imageUrl(b.imageUrl, 'Picture', true)!, title: str(b.title, { max: 80, label: 'Title' }), subtitle: str(b.subtitle, { max: 160, label: 'Subtitle' }), linkUrl: linkUrl(b.linkUrl, 'Link', false), sortOrder: has(b, 'sortOrder') ? int(b.sortOrder, 'Order') : (max._max.sortOrder ?? 0) + 1, isActive: has(b, 'isActive') ? bool(b.isActive, 'Active') : true, startsAt, endsAt },
    });
    await this.log(adminId, meta, 'Added banner' + (row.title ? ' "' + row.title + '"' : ''));
    return row;
  }

  async updateBanner(id: string, input: unknown, adminId: string, meta: ReqMeta) {
    const b = body(input);
    const old = await this.prisma.banner.findUnique({ where: { id } });
    if (!old) throw new NotFoundException('Banner not found');
    const data: Record<string, unknown> = {};
    if (has(b, 'imageUrl')) data.imageUrl = imageUrl(b.imageUrl, 'Picture', true);
    if (has(b, 'title')) data.title = str(b.title, { max: 80, label: 'Title' });
    if (has(b, 'subtitle')) data.subtitle = str(b.subtitle, { max: 160, label: 'Subtitle' });
    if (has(b, 'linkUrl')) data.linkUrl = linkUrl(b.linkUrl, 'Link', false);
    if (has(b, 'sortOrder')) data.sortOrder = int(b.sortOrder, 'Order');
    if (has(b, 'isActive')) data.isActive = bool(b.isActive, 'Active');
    if (has(b, 'startsAt')) data.startsAt = date(b.startsAt, 'Start date');
    if (has(b, 'endsAt')) data.endsAt = date(b.endsAt, 'End date');
    const s = (has(b, 'startsAt') ? data.startsAt : old.startsAt) as Date | null;
    const e = (has(b, 'endsAt') ? data.endsAt : old.endsAt) as Date | null;
    if (s && e && e <= s) throw new BadRequestException('End date must be after the start date');
    const row = await this.unique(() => this.prisma.banner.update({ where: { id }, data }), 'banner');
    await this.log(adminId, meta, 'Updated banner' + (row.title ? ' "' + row.title + '"' : ''), { fields: Object.keys(data) });
    return row;
  }

  async deleteBanner(id: string, adminId: string, meta: ReqMeta) {
    const old = await this.prisma.banner.findUnique({ where: { id } });
    if (!old) throw new NotFoundException('Banner not found');
    await this.prisma.banner.delete({ where: { id } });
    await this.log(adminId, meta, 'Deleted banner' + (old.title ? ' "' + old.title + '"' : ''));
    return { ok: true };
  }

  // ================= Menu =================
  adminMenu() {
    return this.prisma.menuItem.findMany({ orderBy: [{ location: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] });
  }

  private async checkParent(parentId: string | null, location: string, selfId?: string) {
    if (!parentId) return;
    if (parentId === selfId) throw new BadRequestException('An item cannot be inside itself');
    const p = await this.prisma.menuItem.findUnique({ where: { id: parentId } });
    if (!p) throw new BadRequestException('The chosen parent item does not exist');
    if (p.parentId) throw new BadRequestException('Menus can only go one level deep');
    if (p.location !== location) throw new BadRequestException('A dropdown item must be in the same menu as its parent');
  }

  async createMenuItem(input: unknown, adminId: string, meta: ReqMeta) {
    const b = body(input);
    const location = typeof b.location === 'string' && LOCATIONS.includes(b.location) ? b.location : 'NAVBAR';
    const parentId = str(b.parentId, { max: 40, label: 'Parent' });
    await this.checkParent(parentId, location);
    const max = await this.prisma.menuItem.aggregate({ _max: { sortOrder: true }, where: { location: location as any, parentId } });
    const row = await this.prisma.menuItem.create({
      data: { labelEn: str(b.labelEn, { max: 40, required: true, label: 'English label' })!, labelSw: str(b.labelSw, { max: 40, label: 'Swahili label' }), href: linkUrl(b.href, 'Link', true)!, location: location as any, parentId, sortOrder: has(b, 'sortOrder') ? int(b.sortOrder, 'Order') : (max._max.sortOrder ?? 0) + 1, isActive: has(b, 'isActive') ? bool(b.isActive, 'Active') : true },
    });
    await this.log(adminId, meta, 'Added menu link "' + row.labelEn + '" (' + row.location.toLowerCase() + ')');
    return row;
  }

  async updateMenuItem(id: string, input: unknown, adminId: string, meta: ReqMeta) {
    const b = body(input);
    const old = await this.prisma.menuItem.findUnique({ where: { id }, include: { _count: { select: { children: true } } } });
    if (!old) throw new NotFoundException('Menu item not found');
    const data: Record<string, unknown> = {};
    if (has(b, 'labelEn')) data.labelEn = str(b.labelEn, { max: 40, required: true, label: 'English label' });
    if (has(b, 'labelSw')) data.labelSw = str(b.labelSw, { max: 40, label: 'Swahili label' });
    if (has(b, 'href')) data.href = linkUrl(b.href, 'Link', true);
    if (has(b, 'sortOrder')) data.sortOrder = int(b.sortOrder, 'Order');
    if (has(b, 'isActive')) data.isActive = bool(b.isActive, 'Active');
    const location = has(b, 'location') && typeof b.location === 'string' && LOCATIONS.includes(b.location) ? b.location : old.location;
    const parentId = has(b, 'parentId') ? str(b.parentId, { max: 40, label: 'Parent' }) : old.parentId;
    if (location !== old.location) data.location = location;
    if (parentId !== old.parentId) data.parentId = parentId;
    if ((parentId && old._count.children > 0) || (location !== old.location && old._count.children > 0)) throw new BadRequestException('Move or remove the dropdown items under this link first');
    await this.checkParent(parentId, location, id);
    const row = await this.prisma.menuItem.update({ where: { id }, data });
    await this.log(adminId, meta, 'Updated menu link "' + row.labelEn + '"', { fields: Object.keys(data) });
    return row;
  }

  async deleteMenuItem(id: string, adminId: string, meta: ReqMeta) {
    const old = await this.prisma.menuItem.findUnique({ where: { id }, include: { _count: { select: { children: true } } } });
    if (!old) throw new NotFoundException('Menu item not found');
    await this.prisma.menuItem.delete({ where: { id } });
    await this.log(adminId, meta, 'Deleted menu link "' + old.labelEn + '"' + (old._count.children ? ' and its ' + old._count.children + ' dropdown item(s)' : ''));
    return { ok: true };
  }

  // ================= Pages =================
  adminPages() {
    return this.prisma.sitePage.findMany({ orderBy: { titleEn: 'asc' } });
  }

  private pageSlug(v: unknown) {
    const s = str(v, { max: 60, required: true, label: 'Page address' })!.toLowerCase();
    if (!SLUG.test(s)) throw new BadRequestException('Page address can only use lowercase letters, numbers and single dashes');
    return s;
  }

  async createPage(input: unknown, adminId: string, meta: ReqMeta) {
    const b = body(input);
    const row = await this.unique(
      () => this.prisma.sitePage.create({ data: { slug: this.pageSlug(b.slug), titleEn: str(b.titleEn, { max: 120, required: true, label: 'English title' })!, titleSw: str(b.titleSw, { max: 120, label: 'Swahili title' }), bodyEn: str(b.bodyEn, { max: 20000, required: true, label: 'English text' })!, bodySw: str(b.bodySw, { max: 20000, label: 'Swahili text' }), isPublished: has(b, 'isPublished') ? bool(b.isPublished, 'Published') : false } }),
      'page address',
    );
    await this.log(adminId, meta, 'Added page "' + row.titleEn + '" (/' + row.slug + ')');
    return row;
  }

  async updatePage(id: string, input: unknown, adminId: string, meta: ReqMeta) {
    const b = body(input);
    const old = await this.prisma.sitePage.findUnique({ where: { id } });
    if (!old) throw new NotFoundException('Page not found');
    const data: Record<string, unknown> = {};
    if (has(b, 'slug')) data.slug = this.pageSlug(b.slug);
    if (has(b, 'titleEn')) data.titleEn = str(b.titleEn, { max: 120, required: true, label: 'English title' });
    if (has(b, 'titleSw')) data.titleSw = str(b.titleSw, { max: 120, label: 'Swahili title' });
    if (has(b, 'bodyEn')) data.bodyEn = str(b.bodyEn, { max: 20000, required: true, label: 'English text' });
    if (has(b, 'bodySw')) data.bodySw = str(b.bodySw, { max: 20000, label: 'Swahili text' });
    if (has(b, 'isPublished')) data.isPublished = bool(b.isPublished, 'Published');
    const row = await this.unique(() => this.prisma.sitePage.update({ where: { id }, data }), 'page address');
    // key names only: page text can be long
    await this.log(adminId, meta, 'Updated page "' + row.titleEn + '"', { fields: Object.keys(data) });
    return row;
  }

  async deletePage(id: string, adminId: string, meta: ReqMeta) {
    const old = await this.prisma.sitePage.findUnique({ where: { id } });
    if (!old) throw new NotFoundException('Page not found');
    await this.prisma.sitePage.delete({ where: { id } });
    await this.log(adminId, meta, 'Deleted page "' + old.titleEn + '"');
    return { ok: true };
  }
}
