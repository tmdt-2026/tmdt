import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderProductCard } from './components/productCard.js';
import { renderCartDropdown } from './components/cartDropdown.js';
import { renderAccountDropdown } from './components/accountDropdown.js';
import { siteData as localSiteData } from './data/products.js';
import { getSiteData } from './services/siteDataApi.js';
import { cartManager } from './services/cartManager.js';
import { initCheckoutPage } from './pages/checkout.js';
import { initOrderHistoryPage } from './pages/order-history.js';
import { initOrderDetailPage } from './pages/order-detail.js';
import { initAccountProfilePage } from './pages/account-profile.js';
import { initChangePasswordPage } from './pages/change-password.js';
import { initOrderConfirmationPage } from './pages/order-confirmation.js';
import { initLoginPage } from './pages/login.js';
import { initRegisterPage } from './pages/register.js';

const DEFAULT_PAGE_TITLE = document.title;
const SPA_PAGE_PARAM = 'page';
const AUTH_PENDING_ROUTE_KEY = 'iluxury_auth_pending_route';
const SPA_PAGES = new Set([
	'checkout',
	'order-history',
	'order-detail',
	'order-confirmation',
	'account-profile',
	'change-password',
	'login',
	'register'
]);
const CATEGORY_ALIASES = {
	watch: 'apple-watch',
	'am-thanh': 'phu-kien-chinh-hang',
	'phu-kien': 'phu-kien-chinh-hang',
	accessories: 'phu-kien-chinh-hang',
	'all-products': 'all-products'
};

const PRODUCT_IMAGE_POOL_BY_SECTION = {
	mac: [
		'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1200'
	],
	iphone: [
		'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&q=80&w=1200'
	],
	ipad: [
		'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1588702545922-e6ca28c897f7?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&q=80&w=1200'
	],
	'apple-watch': [
		'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=1200'
	],
	'phu-kien-chinh-hang': [
		'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1628286595514-468e2f89f2a4?auto=format&fit=crop&q=80&w=1200',
		'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?auto=format&fit=crop&q=80&w=1200'
	]
};

// Add sample products to cart for testing
function initSampleCart(siteData) {
	if (cartManager.getItems().length === 0) {
		const sampleProducts = [
			siteData.productSections[0].products[0],
			siteData.productSections[1].products[0],
			siteData.productSections[2].products[1]
		];
		sampleProducts.forEach((product, idx) => {
			product.id = idx + 1;
			cartManager.addItem(product);
		});
	}
}

function normalizeText(value = '') {
	return String(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

function toCategorySlug(value = '') {
	return normalizeText(value)
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function resolveCategorySlug(value = '') {
	const slug = toCategorySlug(value);
	return CATEGORY_ALIASES[slug] || slug;
}

function pickField(source, keys, fallback = '') {
	for (const key of keys) {
		const value = source?.[key];
		if (value !== undefined && value !== null && value !== '') {
			return value;
		}
	}
	return fallback;
}

function pickNumberField(source, keys, fallback = null) {
	for (const key of keys) {
		const value = source?.[key];
		if (value === undefined || value === null || value === '') {
			continue;
		}
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}
	return fallback;
}

function pickFieldFromCandidates(candidates, keys, fallback = '') {
	for (const candidate of candidates) {
		const value = pickField(candidate, keys, '');
		if (value !== '') {
			return value;
		}
	}
	return fallback;
}

function pickNumberFieldFromCandidates(candidates, keys, fallback = null) {
	for (const candidate of candidates) {
		const value = pickNumberField(candidate, keys, null);
		if (Number.isFinite(value)) {
			return value;
		}
	}
	return fallback;
}

function getCategoryFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return resolveCategorySlug(params.get('category') || '');
}

function getProductFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return toCategorySlug(params.get('product') || '');
}

function getSpaPageFromUrl() {
	const params = new URLSearchParams(window.location.search);
	const page = toCategorySlug(params.get(SPA_PAGE_PARAM) || '');
	return SPA_PAGES.has(page) ? page : '';
}

function getSpaPageMetaFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return {
		page: getSpaPageFromUrl(),
		id: params.get('id') || ''
	};
}

function setCategoryToUrl(slug, { replace = false } = {}) {
	const url = new URL(window.location.href);
	url.searchParams.delete(SPA_PAGE_PARAM);
	url.searchParams.delete('id');
	url.searchParams.delete('product');
	if (slug) {
		url.searchParams.set('category', slug);
	} else {
		url.searchParams.delete('category');
	}
	if (replace) {
		window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
		return;
	}
	window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function setProductToUrl(productSlug, { categorySlug = '', replace = false } = {}) {
	const url = new URL(window.location.href);
	url.searchParams.delete(SPA_PAGE_PARAM);
	url.searchParams.delete('id');
	if (categorySlug) {
		url.searchParams.set('category', resolveCategorySlug(categorySlug));
	} else {
		url.searchParams.delete('category');
	}
	if (productSlug) {
		url.searchParams.set('product', toCategorySlug(productSlug));
	} else {
		url.searchParams.delete('product');
	}
	if (replace) {
		window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
		return;
	}
	window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function setSpaPageToUrl(page, { id = '', replace = false } = {}) {
	const normalizedPage = toCategorySlug(page || '');
	const url = new URL(window.location.href);
	url.searchParams.delete('category');
	url.searchParams.delete('product');

	if (normalizedPage && SPA_PAGES.has(normalizedPage)) {
		url.searchParams.set(SPA_PAGE_PARAM, normalizedPage);
	} else {
		url.searchParams.delete(SPA_PAGE_PARAM);
	}

	if (id) {
		url.searchParams.set('id', id);
	} else {
		url.searchParams.delete('id');
	}

	if (replace) {
		window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
		return;
	}
	window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function findSectionBySlug(siteData, slug) {
	if (!slug) {
		return null;
	}

	if (slug === 'all-products') {
		const products = siteData.productSections.flatMap((section) => section.products);
		return {
			title: 'Toàn bộ sản phẩm',
			description: `Tổng hợp ${products.length} sản phẩm từ tất cả danh mục tại iLuxury.`,
			products
		};
	}

	const exact = siteData.productSections.find((section) => toCategorySlug(section.title) === slug);
	if (exact) {
		return exact;
	}

	return siteData.productSections.find((section) => {
		const sectionSlug = toCategorySlug(section.title);
		return sectionSlug.includes(slug) || slug.includes(sectionSlug);
	}) || null;
}

function buildProductCatalog(siteData) {
	const fromSections = siteData.productSections.flatMap((section) =>
		section.products.map((product) => {
			const title = pickField(product, ['title', 'name', 'model_name'], 'Sản phẩm');
			const image = pickField(product, ['image', 'thumbnail', 'image_url'], '');
			const sectionTitle = pickField(product, ['categoryName', 'category_name'], section.title);

			return {
				...product,
				title,
				image,
				sectionTitle,
				sectionSlug: toCategorySlug(sectionTitle),
				productSlug: toCategorySlug(title)
			};
		})
	);

	const fromFeatured = (siteData.featuredSection?.products || []).map((product) => {
		const title = pickField(product, ['title', 'name', 'model_name'], 'Sản phẩm');
		const image = pickField(product, ['image', 'thumbnail', 'image_url'], '');

		return {
			...product,
			title,
			image,
			sectionTitle: siteData.featuredSection.title,
			sectionSlug: 'all-products',
			productSlug: toCategorySlug(title)
		};
	});

	return [...fromSections, ...fromFeatured];
}

function findProductBySlug(catalog, productSlug, categorySlug = '') {
	const normalizedProductSlug = toCategorySlug(productSlug);
	if (!normalizedProductSlug) {
		return null;
	}

	const normalizedCategorySlug = resolveCategorySlug(categorySlug || '');
	if (normalizedCategorySlug) {
		const matchInCategory = catalog.find(
			(item) => item.productSlug === normalizedProductSlug && item.sectionSlug === normalizedCategorySlug
		);
		if (matchInCategory) {
			return matchInCategory;
		}
	}

	return catalog.find((item) => item.productSlug === normalizedProductSlug) || null;
}

function extractStorageFromTitle(title = '') {
	const match = String(title).match(/(\d{2,4})\s*GB/i);
	return match ? `${match[1]}GB` : '';
}

function buildCategoryFilters(section) {
	const categorySlug = toCategorySlug(section.title);
	const products = section.products || [];
	const filters = [{ key: 'all', label: 'Tất cả', match: () => true }];

	const categoryFilterMap = {
		mac: [
			{ key: 'macbook-pro', label: 'MacBook Pro', match: (title) => /macbook\s*pro/i.test(title) },
			{ key: 'macbook-air', label: 'MacBook Air', match: (title) => /macbook\s*air/i.test(title) },
			{ key: 'imac', label: 'iMac', match: (title) => /\bimac\b/i.test(title) },
			{ key: 'mac-mini', label: 'Mac mini', match: (title) => /mac\s*mini/i.test(title) },
			{ key: 'display', label: 'Màn hình', match: (title) => /display/i.test(title) }
		],
		iphone: [
			{ key: 'iphone-15-pro-max', label: '15 Pro Max', match: (title) => /iphone\s*15\s*pro\s*max/i.test(title) },
			{ key: 'iphone-15-pro', label: '15 Pro', match: (title) => /iphone\s*15\s*pro(?!\s*max)/i.test(title) },
			{ key: 'iphone-15-plus', label: '15 Plus', match: (title) => /iphone\s*15\s*plus/i.test(title) },
			{ key: 'iphone-15', label: 'iPhone 15', match: (title) => /iphone\s*15(?!\s*pro|\s*plus)/i.test(title) },
			{ key: 'iphone-14', label: 'iPhone 14', match: (title) => /iphone\s*14/i.test(title) },
			{ key: 'iphone-13', label: 'iPhone 13', match: (title) => /iphone\s*13/i.test(title) }
		],
		ipad: [
			{ key: 'ipad-pro', label: 'iPad Pro', match: (title) => /ipad\s*pro/i.test(title) },
			{ key: 'ipad-air', label: 'iPad Air', match: (title) => /ipad\s*air/i.test(title) },
			{ key: 'ipad-mini', label: 'iPad mini', match: (title) => /ipad\s*mini/i.test(title) },
			{ key: 'ipad-gen', label: 'iPad Gen', match: (title) => /ipad\s*gen/i.test(title) },
			{ key: 'apple-pencil', label: 'Apple Pencil', match: (title) => /pencil/i.test(title) }
		],
		'apple-watch': [
			{ key: 'watch-ultra', label: 'Watch Ultra', match: (title) => /watch\s*ultra/i.test(title) },
			{ key: 'watch-series', label: 'Watch Series', match: (title) => /watch\s*series/i.test(title) },
			{ key: 'watch-se', label: 'Watch SE', match: (title) => /watch\s*se/i.test(title) },
			{ key: 'watch-bands', label: 'Dây đeo', match: (title) => /day\s*deo|sport\s*band|milanese/i.test(normalizeText(title)) }
		],
		'phu-kien-chinh-hang': [
			{ key: 'airpods', label: 'AirPods', match: (title) => /airpods/i.test(title) },
			{ key: 'sac', label: 'Sạc', match: (title) => /sac|magsafe|usb-c/i.test(normalizeText(title)) },
			{ key: 'airtag', label: 'AirTag', match: (title) => /airtag/i.test(title) },
			{ key: 'magic', label: 'Magic', match: (title) => /magic/i.test(title) }
		]
	};

	const specificFilters = categoryFilterMap[categorySlug] || [];
	specificFilters.forEach((filter) => {
		const hasAny = products.some((product) => filter.match(product.title || ''));
		if (hasAny) {
			filters.push({
				key: filter.key,
				label: filter.label,
				match: (product) => filter.match(product.title || '')
			});
		}
	});

	const storageSet = new Set(
		products
			.map((product) => extractStorageFromTitle(product.title || ''))
			.filter(Boolean)
	);

	if (storageSet.size > 1) {
		Array.from(storageSet)
			.sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
			.forEach((storage) => {
				filters.push({
					key: `storage-${storage.toLowerCase()}`,
					label: storage,
					match: (product) => extractStorageFromTitle(product.title || '') === storage
				});
			});
	}

	if (products.some((product) => getOriginalPrice(product))) {
		filters.push({
			key: 'sale',
			label: 'Đang giảm giá',
			match: (product) => Boolean(getOriginalPrice(product))
		});
	}

	return filters;
}

function filterProductsByKey(products, filters, activeFilterKey) {
	const active = filters.find((filter) => filter.key === activeFilterKey) || filters[0];
	return products.filter((product) => active.match(product));
}

function renderCategoryNav(items) {
	return items
		.map(
			(item) => `
				<a href="?category=${resolveCategorySlug(item.label)}" class="category-nav-item" data-category="${resolveCategorySlug(item.label)}">
					<div class="category-nav-icon"><i data-lucide="${item.icon}"></i></div>
					<span class="category-nav-name">${item.label}</span>
				</a>
			`
		)
		.join('');
}

function renderSectionHeader(title, viewAllLabel = '', categoryKey = '') {
	const categorySlug = resolveCategorySlug(categoryKey || title);
	const linkMarkup = viewAllLabel
		? `<a href="?category=${categorySlug}" class="btn-view-all" data-category="${categorySlug}">${viewAllLabel} <i data-lucide="arrow-right"></i></a>`
		: '';

	return `
		<div class="section-header">
			<div>
				<h2 class="section-title">${title}</h2>
				<span class="section-accent"></span>
			</div>
			${linkMarkup}
		</div>
	`;
}

function renderFeaturedSection(section) {
	const topProducts = section.products.slice(0, 3);
	const cardsMarkup = topProducts.map((product) => renderProductCard(product, { variant: 'featured' })).join('');

	return `
		<section class="category-section category-featured" data-section-slug="all-products">
			${renderSectionHeader(section.title, 'Xem tất cả', 'all-products')}
			<div class="product-grid">
				${cardsMarkup}
			</div>
		</section>
	`;
}

function getOriginalPrice(product) {
	return product.originalPrice ?? product.original_price ?? product.oldPrice ?? product.compareAtPrice ?? product.giaGoc;
}

function parseCurrencyToNumber(value) {
	if (value === undefined || value === null) {
		return 0;
	}
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	const parsed = Number.parseInt(String(value).replace(/[^\d]/g, ''), 10);
	return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrencyVnd(value) {
	if (!Number.isFinite(value) || value <= 0) {
		return '0₫';
	}
	return `${new Intl.NumberFormat('vi-VN').format(value)}₫`;
}

function guessModelAndCpu(title, sectionSlug) {
	const normalizedTitle = normalizeText(title);
	const mChip = title.match(/\bM(\d)\b/i);
	const aChip = title.match(/\bA(\d{2})\b/i);

	if (mChip) {
		const chipCode = `Apple M${mChip[1]}`;
		return { cpu: chipCode, modelNumber: `M${mChip[1]}-${sectionSlug.toUpperCase()}` };
	}

	if (aChip) {
		const chipCode = `Apple A${aChip[1]} Bionic`;
		return { cpu: chipCode, modelNumber: `A${aChip[1]}-${sectionSlug.toUpperCase()}` };
	}

	if (sectionSlug === 'apple-watch') {
		return { cpu: 'Apple S9 SiP', modelNumber: `S9-${sectionSlug.toUpperCase()}` };
	}

	if (sectionSlug === 'phu-kien-chinh-hang') {
		if (normalizedTitle.includes('airpods')) {
			return { cpu: 'Apple H2', modelNumber: `H2-${sectionSlug.toUpperCase()}` };
		}
		return { cpu: 'Đang cập nhật', modelNumber: `ACC-${sectionSlug.toUpperCase()}` };
	}

	return { cpu: 'Đang cập nhật', modelNumber: `MDL-${sectionSlug.toUpperCase()}` };
}

function normalizeProductImages(product, sectionSlug, title, fallbackImage = '') {
	const imagesFromProductImages = Array.isArray(product.product_images)
		? product.product_images.map((item) => (typeof item === 'string' ? item : item.image_url || item.url || item.src || ''))
		: [];
	const imagesFromAltKeys = [
		...(Array.isArray(product.productImages) ? product.productImages : []),
		...(Array.isArray(product.images) ? product.images : [])
	].map((item) => (typeof item === 'string' ? item : item.image_url || item.url || item.src || ''));

	const sectionPool = PRODUCT_IMAGE_POOL_BY_SECTION[sectionSlug] || [];
	const allCandidates = [fallbackImage, product.image, product.thumbnail, ...imagesFromProductImages, ...imagesFromAltKeys, ...sectionPool]
		.filter(Boolean);
	const uniqueImages = [...new Set(allCandidates)].slice(0, 6);

	return uniqueImages.map((imageUrl, index) => ({
		id: `img-${toCategorySlug(title)}-${index + 1}`,
		image_url: imageUrl,
		alt_text: `${title} - Ảnh ${index + 1}`,
		sort_order: index
	}));
}

function getProductGalleryImages(productEntry) {
	const fromProductImages = Array.isArray(productEntry.product_images)
		? productEntry.product_images.map((item) => (typeof item === 'string' ? item : item.image_url || item.url || item.src || '')).filter(Boolean)
		: [];
	const fromAltKeys = [
		...(Array.isArray(productEntry.productImages) ? productEntry.productImages : []),
		...(Array.isArray(productEntry.images) ? productEntry.images : [])
	].map((item) => (typeof item === 'string' ? item : item.image_url || item.url || item.src || '')).filter(Boolean);
	const allCandidates = [productEntry.image, productEntry.thumbnail, ...fromProductImages, ...fromAltKeys].filter(Boolean);
	const uniqueImages = [...new Set(allCandidates)];
	return uniqueImages.length ? uniqueImages : [''];
}

function buildVariantScenariosBySection(sectionSlug) {
	if (sectionSlug === 'iphone') {
		return {
			storages: [128, 256, 512],
			colors: ['Titan Đen', 'Titan Tự Nhiên', 'Titan Xanh'],
			priceStep: 3000000
		};
	}
	if (sectionSlug === 'ipad') {
		return {
			storages: [128, 256, 512],
			colors: ['Xám Không Gian', 'Bạc', 'Xanh Dương'],
			priceStep: 2200000
		};
	}
	if (sectionSlug === 'mac') {
		return {
			storages: [256, 512, 1024],
			colors: ['Bạc', 'Xám Không Gian'],
			priceStep: 4500000
		};
	}
	if (sectionSlug === 'apple-watch') {
		return {
			storages: [null],
			colors: ['Đen', 'Bạc', 'Vàng Hồng'],
			priceStep: 600000
		};
	}
	return {
		storages: [null],
		colors: ['Tiêu chuẩn'],
		priceStep: 250000
	};
}

function normalizeVariantRecord(variant, fallback) {
	const priceValue = pickNumberField(variant, ['price', 'price_value'], fallback.priceValue);
	const originalPriceValue = pickNumberField(variant, ['original_price', 'originalPrice', 'original_price_value'], fallback.originalPriceValue || 0);
	const quantity = pickNumberField(variant, ['quantity', 'stock', 'inventory_quantity'], fallback.stockValue);
	const storage = pickNumberField(variant, ['storage', 'storage_gb'], fallback.storageValue);
	const ram = pickNumberField(variant, ['ram', 'ram_gb'], fallback.ramValue);

	return {
		id: pickField(variant, ['id', 'variant_id', 'variantId'], fallback.variantId),
		product_id: pickField(variant, ['product_id', 'productId'], fallback.productId),
		sku: pickField(variant, ['sku', 'variant_sku', 'variantSku'], fallback.sku),
		color: pickField(variant, ['color', 'colour'], fallback.colorValue),
		ram,
		storage,
		import_price: pickNumberField(variant, ['import_price', 'importPrice'], Math.max(Math.round(priceValue * 0.72), 1)),
		original_price: originalPriceValue > 0 ? originalPriceValue : null,
		price: priceValue,
		quantity,
		is_active: pickField(variant, ['is_active', 'isActive'], true)
	};
}

function buildProductVariants(product, fallback) {
	const providedVariants = Array.isArray(product.variants)
		? product.variants
		: Array.isArray(product.product_variants)
			? product.product_variants
			: [];

	if (providedVariants.length > 0) {
		return providedVariants.map((variant) => normalizeVariantRecord(variant, fallback));
	}

	const scenario = buildVariantScenariosBySection(fallback.sectionSlug);
	const baseStorage = fallback.storageValue ?? scenario.storages[0];
	const baseStorageIndex = Math.max(scenario.storages.indexOf(baseStorage), 0);
	const baseColor = fallback.colorValue || scenario.colors[0];
	const baseColorIndex = Math.max(scenario.colors.indexOf(baseColor), 0);

	const variants = [];
	for (const storageCandidate of scenario.storages) {
		for (const colorCandidate of scenario.colors) {
			if (fallback.sectionSlug === 'phu-kien-chinh-hang' && variants.length >= 2) {
				continue;
			}

			const storageIndex = Math.max(scenario.storages.indexOf(storageCandidate), 0);
			const colorIndex = Math.max(scenario.colors.indexOf(colorCandidate), 0);
			const deltaIndex = (storageIndex - baseStorageIndex) + (colorIndex - baseColorIndex) * 0.25;
			const price = Math.max(Math.round(fallback.priceValue + deltaIndex * scenario.priceStep), 1000);
			const original = fallback.originalPriceValue > 0
				? Math.max(Math.round(fallback.originalPriceValue + deltaIndex * scenario.priceStep), price)
				: null;

			variants.push({
				id: `${fallback.variantId}-${storageCandidate || 'base'}-${toCategorySlug(colorCandidate)}`,
				product_id: fallback.productId,
				sku: `${fallback.sku}-${storageCandidate || 'STD'}-${toCategorySlug(colorCandidate).toUpperCase()}`,
				color: colorCandidate,
				ram: fallback.ramValue,
				storage: storageCandidate,
				import_price: Math.max(Math.round(price * 0.72), 1),
				original_price: original,
				price,
				quantity: Math.max(Math.round(fallback.stockValue - storageIndex + colorIndex), 1),
				is_active: true
			});
		}
	}

	return variants.length ? variants : [normalizeVariantRecord({}, fallback)];
}

function buildSampleReviewsForProduct(title, sectionSlug, productId) {
	const reviewPools = {
		mac: [
			'Hiệu năng ổn định, xử lý đa nhiệm mượt và pin đáp ứng tốt cả ngày làm việc.',
			'Màn hình đẹp, bàn phím gõ êm, phù hợp cho công việc văn phòng và sáng tạo nội dung.',
			'Đóng gói cẩn thận, máy mới nguyên seal và hỗ trợ cài đặt rất nhanh.'
		],
		iphone: [
			'Camera chụp đêm tốt, máy mượt và pin dùng thoải mái trong ngày.',
			'Cảm giác cầm chắc tay, màn hình đẹp và loa ngoài rõ ràng.',
			'Hiệu năng ổn định khi chơi game và xử lý tác vụ nặng.'
		],
		ipad: [
			'Màn hình sắc nét, thao tác bút mượt và rất phù hợp để ghi chú học tập.',
			'Gọn nhẹ, pin tốt, dùng giải trí và làm việc đều ổn định.',
			'Loa nghe hay, trải nghiệm xem phim rất ấn tượng.'
		],
		'apple-watch': [
			'Theo dõi sức khỏe chính xác, đeo cả ngày vẫn thoải mái.',
			'Thông báo nhanh và đồng bộ tốt với iPhone.',
			'Pin ổn, sạc nhanh và chất lượng hoàn thiện cao.'
		],
		'phu-kien-chinh-hang': [
			'Phụ kiện chính hãng, hoàn thiện tốt và dùng ổn định.',
			'Kết nối nhanh, tương thích tốt với hệ sinh thái Apple.',
			'Đúng mô tả, giao hàng nhanh và đóng gói kỹ.'
		]
	};

	const names = ['Minh Anh', 'Khánh An', 'Tuấn Khang', 'Mai Trâm', 'Gia Huy', 'Ngọc Hân'];
	const pool = reviewPools[sectionSlug] || reviewPools.iphone;
	const slug = toCategorySlug(title || 'san-pham');
	const dateSeeds = [3, 6, 10, 14];
	const ratings = [5, 5, 4, 4];

	return dateSeeds.map((day, index) => {
		const d = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
		return {
			id: `rvw-${slug}-${index + 1}`,
			user_id: `usr-${slug}-${index + 1}`,
			product_id: productId,
			order_id: `ord-${slug}-${index + 1}`,
			rating: ratings[index],
			content: pool[index % pool.length],
			is_visible: true,
			created_at: d.toISOString(),
			customer_name: names[index % names.length]
		};
	});
}

function normalizeSiteDataByDatabaseSchema(siteData) {
	const sectionCategoryMap = new Map(
		(siteData.productSections || []).map((section) => [
			section.title,
			{
				id: `cat-${toCategorySlug(section.title)}`,
				name: section.title,
				slug: toCategorySlug(section.title),
				is_active: true
			}
		])
	);

	const enrichProduct = (product, sectionTitle) => {
		const category = sectionCategoryMap.get(sectionTitle) || {
			id: `cat-${toCategorySlug(sectionTitle)}`,
			name: sectionTitle,
			slug: toCategorySlug(sectionTitle),
			is_active: true
		};
		const sectionSlug = category.slug;
		const title = pickField(product, ['title', 'name', 'model_name'], 'Sản phẩm');
		const storageFromTitle = extractStorageFromTitle(title);
		const storageValue = pickNumberField(product, ['storage', 'storage_gb'], null)
			?? (storageFromTitle ? Number.parseInt(storageFromTitle, 10) : null);
		const ramValue = pickNumberField(product, ['ram', 'ram_gb'], null)
			?? (sectionSlug === 'mac' ? 8 : (sectionSlug === 'iphone' || sectionSlug === 'ipad' ? 6 : null));
		const priceValue = pickNumberField(product, ['priceValue', 'price_value', 'price'], parseCurrencyToNumber(product.price));
		const originalPriceValue = pickNumberField(product, ['originalPriceValue', 'original_price_value', 'original_price'], parseCurrencyToNumber(getOriginalPrice(product)));
		const colorValue = pickField(product, ['color', 'colour'], sectionSlug === 'phu-kien-chinh-hang' ? 'N/A' : 'Nhiều màu');
		const stockValue = pickNumberField(product, ['stock', 'quantity', 'inventory_quantity'], 12);
		const { cpu, modelNumber } = guessModelAndCpu(title, sectionSlug);

		const productId = pickField(product, ['id', 'product_id'], `prd-${toCategorySlug(title)}`);
		const modelId = pickField(product, ['model_id', 'modelId'], `mdl-${toCategorySlug(title)}`);
		const variantId = pickField(product, ['variant_id', 'variantId'], `var-${toCategorySlug(title)}`);
		const skuFallback = pickField(product, ['sku', 'variant_sku', 'variantSku'], `SKU-${toCategorySlug(title).toUpperCase().slice(0, 18)}`);
		const normalizedProductImages = normalizeProductImages(product, sectionSlug, title, pickField(product, ['image', 'thumbnail', 'image_url'], ''));

		const variants = buildProductVariants(product, {
			sectionSlug,
			productId,
			variantId,
			sku: skuFallback,
			priceValue,
			originalPriceValue,
			storageValue,
			ramValue,
			colorValue,
			stockValue
		});

		const preferredVariant = variants.find((item) => {
			if (storageValue && item.storage !== storageValue) {
				return false;
			}
			if (colorValue && item.color !== colorValue) {
				return false;
			}
			return true;
		}) || variants[0];

		const activePriceValue = pickNumberField(preferredVariant, ['price'], priceValue);
		const activeOriginalPriceValue = pickNumberField(preferredVariant, ['original_price'], originalPriceValue);
		const activeStockValue = pickNumberField(preferredVariant, ['quantity'], stockValue);
		const sourceReviews = [
			...(Array.isArray(product.reviews) ? product.reviews : []),
			...(Array.isArray(product.review_list) ? product.review_list : []),
			...(Array.isArray(product.product_reviews) ? product.product_reviews : [])
		];
		const reviews = sourceReviews.length
			? sourceReviews
			: buildSampleReviewsForProduct(title, sectionSlug, productId);
		const ratingAverage = reviews.length
			? reviews.reduce((sum, item) => sum + Number(pickField(item, ['rating', 'score'], 5)), 0) / reviews.length
			: 4.8;

		return {
			...product,
			id: productId,
			product_id: productId,
			name: title,
			title,
			category_id: category.id,
			category_slug: category.slug,
			thumbnail: pickField(product, ['thumbnail', 'image', 'image_url'], ''),
			product_images: normalizedProductImages,
			model_id: modelId,
			model: {
				id: modelId,
				model_name: title,
				model_number: modelNumber,
				brand: 'Apple',
				cpu,
				screen_size: pickNumberField(product, ['screen_size', 'screenSize'], null),
				opera_system: pickField(product, ['opera_system', 'operaSystem'], ''),
				is_active: true
			},
			variant_id: variantId,
			variant: preferredVariant,
			variants,
			inventory: {
				product_variant_id: preferredVariant.id,
				quantity: activeStockValue,
				reserved_quantity: 0
			},
			priceValue: activePriceValue,
			originalPriceValue: activeOriginalPriceValue > 0 ? activeOriginalPriceValue : undefined,
			price: formatCurrencyVnd(activePriceValue),
			originalPrice: activeOriginalPriceValue > 0 ? formatCurrencyVnd(activeOriginalPriceValue) : undefined,
			rating: Number(ratingAverage.toFixed(1)),
			reviewCount: reviews.length,
			reviews,
			stock: activeStockValue,
			image: normalizedProductImages[0]?.image_url || pickField(product, ['image', 'thumbnail', 'image_url'], '')
		};
	};

	const normalizedSections = (siteData.productSections || []).map((section) => ({
		...section,
		products: (section.products || []).map((product) => enrichProduct(product, section.title))
	}));

	const sectionByProductSlug = new Map(
		normalizedSections.flatMap((section) =>
			section.products.map((product) => [toCategorySlug(product.title), { product, sectionTitle: section.title }])
		)
	);

	const normalizedFeatured = {
		...(siteData.featuredSection || {}),
		products: (siteData.featuredSection?.products || []).map((product) => {
			const title = pickField(product, ['title', 'name', 'model_name'], 'Sản phẩm');
			const hit = sectionByProductSlug.get(toCategorySlug(title));
			if (hit) {
				return {
					...hit.product,
					badge: product.badge || hit.product.badge,
					badgeStyle: product.badgeStyle || hit.product.badgeStyle
				};
			}
			return enrichProduct(product, siteData.featuredSection?.title || 'Toàn bộ sản phẩm');
		})
	};

	return {
		...siteData,
		productSections: normalizedSections,
		featuredSection: normalizedFeatured
	};
}

function buildFlashSaleProducts(siteData) {
	const products = siteData.productSections
		.flatMap((section) => section.products)
		.filter((product) => getOriginalPrice(product))
		.slice(0, 8);

	return products;
}

function renderFlashSale(products) {
	if (products.length === 0) {
		return '';
	}

	const cardsMarkup = products
		.map((product) => renderProductCard({ ...product, badge: product.badge || 'FLASH' }, { variant: 'compact' }))
		.join('');

	return `
		<section class="flash-sale-section">
			<div class="flash-sale-head">
				<div class="flash-label">⚡ FLASH SALE</div>
				<div class="flash-timer" id="flash-timer">Kết thúc sau: 02 : 34 : 17</div>
			</div>
			<div class="flash-sale-track">
				${cardsMarkup}
			</div>
		</section>
	`;
}

function renderProductSection(section) {
	const cardsMarkup = section.products.map((product) => renderProductCard(product)).join('');
	const isIphoneSection = section.title.toLowerCase().includes('iphone');
	const tabsMarkup = isIphoneSection
		? `
			<div class="product-filter-tabs" role="tablist" aria-label="Lọc iPhone">
				<button class="filter-tab active" type="button">Tất cả</button>
				<button class="filter-tab" type="button">iPhone 16</button>
				<button class="filter-tab" type="button">iPhone 15</button>
				<button class="filter-tab" type="button">iPhone SE</button>
			</div>
		`
		: '';
	const sectionStyle = section.isLastSection ? ' style="margin-bottom: 0; padding-bottom: 80px;"' : '';
	const sectionSlug = toCategorySlug(section.title);

	return `
		<section class="category-section" data-section-slug="${sectionSlug}"${sectionStyle}>
			${renderSectionHeader(section.title, section.viewAllLabel, section.title)}
			${tabsMarkup}
			<div class="product-grid">
				${cardsMarkup}
			</div>
			<div class="view-more-center">
				<button class="btn btn-secondary">${section.viewMoreLabel}</button>
			</div>
		</section>
	`;
}

function renderCategoryProductsPage(section, filters, activeFilterKey, filteredProducts) {
	const products = section.products || [];
	const viewProducts = filteredProducts || products;
	const sectionSlug = toCategorySlug(section.title);
	const cardsMarkup = viewProducts.map((product) => renderProductCard(product)).join('');
	const filterTabs = filters
		.map((filter) => {
			const isActive = filter.key === activeFilterKey;
			return `<button type="button" class="filter-tab category-filter-btn${isActive ? ' active' : ''}" data-filter-key="${filter.key}">${filter.label}</button>`;
		})
		.join('');

	return `
		<section class="category-page section" data-section-slug="${sectionSlug}">
			<div class="category-page-head">
				<button type="button" class="btn btn-secondary category-back-btn" data-route="home">
					<i data-lucide="arrow-left"></i>
					Quay lại trang chủ
				</button>
				<p class="category-page-kicker">Danh mục sản phẩm</p>
				<h1 class="category-page-title">${section.title}</h1>
				<p class="category-page-desc">${section.description || `Hiển thị toàn bộ ${products.length} sản phẩm trong danh mục ${section.title}.`}</p>
				<div class="category-page-meta">Hiển thị: <strong>${viewProducts.length}</strong> / ${products.length} sản phẩm</div>
			</div>
			<div class="product-filter-tabs category-page-tabs" role="tablist" aria-label="Bộ lọc sản phẩm theo danh mục">
				${filterTabs}
			</div>
			<div class="product-grid">
				${cardsMarkup}
			</div>
		</section>
	`;
}

function renderCategoryNotFound(slug) {
	return `
		<section class="category-page section">
			<div class="category-page-head">
				<button type="button" class="btn btn-secondary category-back-btn" data-route="home">
					<i data-lucide="arrow-left"></i>
					Quay lại trang chủ
				</button>
				<p class="category-page-kicker">Danh mục sản phẩm</p>
				<h1 class="category-page-title">Không tìm thấy danh mục</h1>
				<p class="category-page-desc">Danh mục "${slug}" chưa tồn tại. Vui lòng chọn lại từ danh mục có sẵn.</p>
			</div>
		</section>
	`;
}

function buildTechnicalSpecs(productEntry) {
	const variantCandidate = productEntry.variant || productEntry.productVariant || productEntry.product_variant || null;
	const productCandidate = productEntry.product || null;
	const modelCandidate = productEntry.model || productCandidate?.model || null;
	const candidates = [variantCandidate, productEntry, productCandidate, modelCandidate].filter(Boolean);

	const title = pickFieldFromCandidates(candidates, ['title', 'name', 'product_name', 'model_name'], 'Sản phẩm');
	const normalizedTitle = normalizeText(title);
	const sectionSlug = pickFieldFromCandidates(candidates, ['sectionSlug', 'category_slug'], '');
	const storageValue = pickNumberFieldFromCandidates(candidates, ['storage', 'storage_gb'], null);
	const storage = storageValue ? `${storageValue}GB` : extractStorageFromTitle(title);
	const screenMatch = title.match(/(\d{1,2}(?:[\.,]\d+)?)\s*(?:-?inch|"|inches)/i);
	const screenSizeValue = pickFieldFromCandidates(candidates, ['screenSize', 'screen_size'], '');
	const screenSize = screenSizeValue || (screenMatch ? `${screenMatch[1].replace(',', '.')} inch` : 'Đang cập nhật');
	const modelName = pickFieldFromCandidates(candidates, ['model_name', 'modelName'], 'Đang cập nhật');
	const modelNumber = pickFieldFromCandidates(candidates, ['model_number', 'modelNumber'], 'Đang cập nhật');
	const brand = pickFieldFromCandidates(candidates, ['brand'], 'Apple');
	const cpu = pickFieldFromCandidates(candidates, ['cpu', 'chip', 'processor'], 'Đang cập nhật');

	const guessedOperatingSystem = (() => {
		const os = pickFieldFromCandidates(candidates, ['operaSystem', 'opera_system', 'operatingSystem', 'operating_system'], '');
		if (os) {
			return os;
		}
		if (sectionSlug === 'apple-watch') {
			return 'watchOS';
		}
		if (sectionSlug === 'ipad') {
			return 'iPadOS';
		}
		if (sectionSlug === 'iphone') {
			return 'iOS';
		}
		if (sectionSlug === 'mac') {
			return 'macOS';
		}
		return 'Đang cập nhật';
	})();

	const guessedRam = (() => {
		const ramValue = pickNumberFieldFromCandidates(candidates, ['ram', 'ram_gb'], null);
		if (ramValue && ramValue > 0) {
			return `${ramValue}GB`;
		}
		if (sectionSlug === 'mac') {
			return '8GB';
		}
		if (sectionSlug === 'iphone' || sectionSlug === 'ipad') {
			return '6GB';
		}
		return 'Đang cập nhật';
	})();

	const guessedColor = (() => {
		const color = pickFieldFromCandidates(candidates, ['color', 'colour'], '');
		if (color) {
			return color;
		}
		if (/titan|silver|gray|black|white|blue|pink|purple|midnight|starlight/.test(normalizedTitle)) {
			return 'Theo phiên bản trong tiêu đề';
		}
		return 'Nhiều lựa chọn';
	})();

	const sku = pickFieldFromCandidates(candidates, ['sku', 'variantSku', 'variant_sku'], `ILX-${toCategorySlug(title).toUpperCase().replace(/-/g, '').slice(0, 12)}`);
	const stock = pickNumberFieldFromCandidates(candidates, ['stock', 'quantity', 'inventoryQuantity', 'inventory_quantity'], null);
	const stockStatus = productEntry.outOfStock || stock === 0
		? 'Hết hàng'
		: Number.isFinite(stock)
			? `Còn ${stock} sản phẩm`
			: 'Còn hàng';

	return [
		{ key: 'model_name', label: 'Tên model', value: modelName },
		{ key: 'model_number', label: 'Mã model', value: modelNumber },
		{ label: 'Thương hiệu', value: brand },
		{ label: 'Danh mục', value: productEntry.sectionTitle || 'Đang cập nhật' },
		{ key: 'sku', label: 'SKU', value: sku },
		{ label: 'CPU / Chip', value: cpu },
		{ key: 'storage', label: 'Dung lượng', value: storage || 'Đang cập nhật' },
		{ key: 'ram', label: 'RAM', value: guessedRam },
		{ key: 'color', label: 'Màu sắc', value: guessedColor },
		{ label: 'Màn hình', value: screenSize },
		{ label: 'Hệ điều hành', value: guessedOperatingSystem },
		{ key: 'stock_status', label: 'Tình trạng kho', value: stockStatus }
	];
}

function getProductVariants(productEntry) {
	const source = Array.isArray(productEntry.variants)
		? productEntry.variants
		: Array.isArray(productEntry.product_variants)
			? productEntry.product_variants
			: productEntry.variant
				? [productEntry.variant]
				: [];

	const fallback = {
		id: pickField(productEntry, ['variant_id', 'variantId'], `var-${toCategorySlug(productEntry.title || '')}`),
		product_id: pickField(productEntry, ['id', 'product_id'], `prd-${toCategorySlug(productEntry.title || '')}`),
		sku: pickField(productEntry, ['sku', 'variant_sku', 'variantSku'], `SKU-${toCategorySlug(productEntry.title || '').toUpperCase().slice(0, 18)}`),
		color: pickField(productEntry, ['color'], 'Tiêu chuẩn'),
		ram: pickNumberField(productEntry, ['ram', 'ram_gb'], null),
		storage: pickNumberField(productEntry, ['storage', 'storage_gb'], null),
		import_price: Math.max(Math.round(parseCurrencyToNumber(productEntry.price) * 0.72), 1),
		original_price: pickNumberField(productEntry, ['original_price', 'originalPriceValue'], 0) || null,
		price: parseCurrencyToNumber(productEntry.price),
		quantity: pickNumberField(productEntry, ['stock', 'quantity'], 0),
		is_active: true
	};

	if (!source.length) {
		return [fallback];
	}

	return source.map((variant, index) => ({
		id: pickField(variant, ['id', 'variant_id', 'variantId'], `${fallback.id}-${index + 1}`),
		product_id: pickField(variant, ['product_id', 'productId'], fallback.product_id),
		sku: pickField(variant, ['sku', 'variant_sku', 'variantSku'], `${fallback.sku}-${index + 1}`),
		color: pickField(variant, ['color', 'colour'], fallback.color),
		ram: pickNumberField(variant, ['ram', 'ram_gb'], fallback.ram),
		storage: pickNumberField(variant, ['storage', 'storage_gb'], fallback.storage),
		import_price: pickNumberField(variant, ['import_price', 'importPrice'], fallback.import_price),
		original_price: pickNumberField(variant, ['original_price', 'originalPrice'], fallback.original_price || 0) || null,
		price: pickNumberField(variant, ['price', 'price_value'], fallback.price),
		quantity: pickNumberField(variant, ['quantity', 'stock', 'inventory_quantity'], fallback.quantity),
		is_active: pickField(variant, ['is_active', 'isActive'], true)
	}));
}

function getFallbackReviewsByCategory(sectionSlug = '') {
	if (sectionSlug === 'mac') {
		return [
			{ customer_name: 'Quốc Bảo', rating: 5, content: 'Máy mượt, pin ổn định, xử lý đồ họa tốt hơn kỳ vọng của mình.', created_at: '2026-03-25T08:00:00Z' },
			{ customer_name: 'Mai Trâm', rating: 5, content: 'Đóng gói kỹ, máy mới nguyên seal và hỗ trợ cài đặt rất nhanh.', created_at: '2026-03-21T10:15:00Z' },
			{ customer_name: 'Anh Kiệt', rating: 4, content: 'Bàn phím và màn hình đẹp, làm việc văn phòng cả ngày vẫn thoải mái.', created_at: '2026-03-15T14:20:00Z' },
			{ customer_name: 'Tuấn Minh', rating: 4, content: 'Hiệu năng ổn, thời lượng pin tốt cho công việc hàng ngày.', created_at: '2026-03-11T09:10:00Z' }
		];
	}

	if (sectionSlug === 'phu-kien-chinh-hang') {
		return [
			{ customer_name: 'Bảo Ngọc', rating: 5, content: 'Phụ kiện chính hãng, hoàn thiện tốt và dùng ổn định.', created_at: '2026-03-26T04:40:00Z' },
			{ customer_name: 'Hữu Tín', rating: 4, content: 'Kết nối nhanh, đóng gói cẩn thận, nhận hàng đúng lịch.', created_at: '2026-03-23T12:00:00Z' },
			{ customer_name: 'Minh Long', rating: 5, content: 'Trải nghiệm sử dụng rất tốt, đúng như mô tả trên website.', created_at: '2026-03-19T08:30:00Z' },
			{ customer_name: 'Việt Anh', rating: 3, content: 'Sản phẩm ổn nhưng mình mong có thêm nhiều màu để lựa chọn.', created_at: '2026-03-10T17:35:00Z' }
		];
	}

	return [
		{ customer_name: 'Thanh Vy', rating: 5, content: 'Sản phẩm đẹp, đúng mô tả và hiệu năng rất ổn định khi sử dụng hằng ngày.', created_at: '2026-03-26T06:00:00Z' },
		{ customer_name: 'Gia Huy', rating: 5, content: 'Giao hàng nhanh, hộp nguyên vẹn, nhân viên tư vấn rõ ràng và nhiệt tình.', created_at: '2026-03-22T10:45:00Z' },
		{ customer_name: 'Khánh An', rating: 4, content: 'Giá tốt, trải nghiệm tổng thể hài lòng, sẽ tiếp tục ủng hộ lần sau.', created_at: '2026-03-19T16:20:00Z' },
		{ customer_name: 'Mỹ Linh', rating: 3, content: 'Tổng thể ổn, cần thêm thông tin kỹ thuật chi tiết hơn cho người mới.', created_at: '2026-03-12T07:10:00Z' }
	];
}

function formatReviewTimestamp(value) {
	if (!value) {
		return 'Gần đây';
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return String(value);
	}

	return new Intl.DateTimeFormat('vi-VN', {
		hour: '2-digit',
		minute: '2-digit',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}).format(parsed);
}

function formatIdForUi(value = '') {
	const text = String(value || 'N/A');
	if (text.length <= 18) {
		return text;
	}
	return `${text.slice(0, 8)}...${text.slice(-4)}`;
}

function buildProductReviews(productEntry) {
	const sectionSlug = pickField(productEntry, ['sectionSlug', 'category_slug'], '');
	const productId = pickField(productEntry, ['id', 'product_id'], `prd-${sectionSlug || 'demo'}-001`);
	const ratingRaw = Number(pickField(productEntry, ['rating', 'average_rating', 'avg_rating'], '4.8'));
	const rating = Number.isFinite(ratingRaw)
		? Math.min(5, Math.max(1, ratingRaw))
		: 4.8;

	const reviewCountRaw = pickNumberField(productEntry, ['reviewCount', 'review_count', 'ratings_count', 'reviews_count'], null);
	const reviewCount = Number.isFinite(reviewCountRaw) && reviewCountRaw > 0
		? Math.round(reviewCountRaw)
		: 128;

	const sourceReviews = [
		...(Array.isArray(productEntry.reviews) ? productEntry.reviews : []),
		...(Array.isArray(productEntry.review_list) ? productEntry.review_list : []),
		...(Array.isArray(productEntry.product_reviews) ? productEntry.product_reviews : [])
	];

	const normalizedReviews = sourceReviews
		.map((review, index) => {
			const value = review && typeof review === 'object' ? review : {};
			const reviewRatingRaw = Number(pickField(value, ['rating', 'score'], rating));
			const reviewRating = Number.isFinite(reviewRatingRaw)
				? Math.min(5, Math.max(1, Math.round(reviewRatingRaw)))
				: Math.round(rating);
			const createdAtRaw = pickField(value, ['created_at', 'createdAt', 'time', 'date'], '');
			const reviewId = pickField(value, ['id', 'review_id'], `rvw-${sectionSlug || 'general'}-${String(index + 1).padStart(3, '0')}`);
			const reviewUserId = pickField(value, ['user_id', 'userId'], `usr-${sectionSlug || 'guest'}-${String(index + 1).padStart(3, '0')}`);
			const reviewOrderId = pickField(value, ['order_id', 'orderId'], `ord-${sectionSlug || 'demo'}-${String(index + 1).padStart(3, '0')}`);
			const visibilityField = pickField(value, ['is_visible', 'isVisible'], true);
			const isVisible = visibilityField === true || visibilityField === 1 || visibilityField === '1' || visibilityField === 'true';
			
			const sellerResponseRaw = pickField(value, ['seller_response', 'admin_response', 'response'], '');
			const sellerResponse = sellerResponseRaw && Math.random() > 0.7 ? sellerResponseRaw : '';
			
			const helpfulCountRaw = pickNumberField(value, ['helpful_count', 'helpful', 'likes'], null);
			const helpfulCount = Number.isFinite(helpfulCountRaw) && helpfulCountRaw >= 0
				? helpfulCountRaw
				: Math.floor(Math.random() * 30);
			
			return {
				id: String(reviewId),
				user_id: String(reviewUserId),
				product_id: String(pickField(value, ['product_id', 'productId'], productId)),
				order_id: String(reviewOrderId),
				is_visible: isVisible,
				created_at: createdAtRaw || 'Gần đây',
				name: pickField(value, ['name', 'author', 'customer_name'], `Khách hàng ${index + 1}`),
				rating: reviewRating,
				text: pickField(value, ['comment', 'content', 'text'], 'Đánh giá tích cực từ khách hàng đã mua sản phẩm.'),
				display_time: formatReviewTimestamp(createdAtRaw),
				seller_response: sellerResponse,
				helpful_count: helpfulCount
			};
		})
		.filter((review) => {
			if (!review.text || !review.is_visible) {
				return false;
			}

			return !productId ? true : review.product_id === productId;
		});

	const reviews = normalizedReviews.slice(0, 8);
	const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
		star,
		count: reviews.filter((item) => item.rating === star).length
	}));
	const breakdown = ratingCounts.map((item) => ({
		star: item.star,
		percent: reviews.length ? Math.round((item.count / reviews.length) * 100) : 0,
		count: item.count
	}));
	const totalPercent = breakdown.reduce((sum, item) => sum + item.percent, 0);
	if (breakdown.length && totalPercent !== 100) {
		breakdown[0].percent += 100 - totalPercent;
	}

	const effectiveRating = reviews.length
		? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
		: rating;

	const recommendationRate = Math.max(80, Math.min(99, Math.round((effectiveRating / 5) * 100)));
	const effectiveReviewCount = reviews.length || reviewCount;

	return {
		rating: effectiveRating,
		reviewCount: effectiveReviewCount,
		recommendationRate,
		breakdown,
		reviews,
		ratingCounts
	};
}

function renderProductDetailPage(productEntry, relatedProducts = []) {
	const variants = getProductVariants(productEntry);
	const selectedVariant = variants[0];
	const reviewData = buildProductReviews(productEntry);
	const galleryImages = getProductGalleryImages(productEntry);
	const mainImage = galleryImages[0] || productEntry.image || '';
	const originalPrice = selectedVariant?.original_price ? formatCurrencyVnd(selectedVariant.original_price) : getOriginalPrice(productEntry);
	const selectedPrice = selectedVariant?.price ? formatCurrencyVnd(selectedVariant.price) : (productEntry.price || 'Liên hệ');
	const discountMarkup = originalPrice
		? `<span class="product-detail-original" data-detail-price-original>${originalPrice}</span><span class="product-detail-saving" data-detail-price-saving>Tiết kiệm ${calcSavings(originalPrice, selectedPrice || '0₫')}</span>`
		: '';
	const storage = extractStorageFromTitle(productEntry.title || '');
	const uniqueStorages = [...new Set(variants.map((item) => item.storage).filter((item) => Number.isFinite(item)))];
	const uniqueColors = [...new Set(variants.map((item) => item.color).filter(Boolean))];
	const variantPayload = escapeAttribute(JSON.stringify(variants));
	const variantStorageMarkup = uniqueStorages.length > 1
		? `
			<div class="variant-group">
				<p class="variant-group-label">Dung lượng</p>
				<div class="variant-options" role="tablist" aria-label="Chọn dung lượng">
					${uniqueStorages
						.map((item) => `<button type="button" class="variant-option-btn${selectedVariant?.storage === item ? ' active' : ''}" data-option-type="storage" data-option-value="${item}">${item}GB</button>`)
						.join('')}
				</div>
			</div>
		`
		: '';
	const variantColorMarkup = uniqueColors.length > 1
		? `
			<div class="variant-group">
				<p class="variant-group-label">Màu sắc</p>
				<div class="variant-options" role="tablist" aria-label="Chọn màu sắc">
					${uniqueColors
						.map((item) => `<button type="button" class="variant-option-btn${selectedVariant?.color === item ? ' active' : ''}" data-option-type="color" data-option-value="${escapeAttribute(item)}">${item}</button>`)
						.join('')}
				</div>
			</div>
		`
		: '';
	const specChips = [
		productEntry.sectionTitle,
		storage,
		productEntry.badge ? `Tag ${productEntry.badge}` : ''
	].filter(Boolean);
	const galleryThumbMarkup = galleryImages.length > 1
		? `
			<div class="product-detail-thumbs" aria-label="Danh sách ảnh sản phẩm">
				${galleryImages
					.map((imageUrl, index) => `
						<button type="button" class="product-thumb-btn${index === 0 ? ' active' : ''}" data-detail-thumb data-image-src="${escapeAttribute(imageUrl)}" aria-label="Xem ảnh ${index + 1}">
							<img src="${imageUrl}" alt="${productEntry.title} - Thumbnail ${index + 1}" loading="lazy" onerror="this.style.opacity='0'">
						</button>
					`)
					.join('')}
			</div>
		`
		: '';
	const technicalSpecs = buildTechnicalSpecs(productEntry);
	const technicalSpecsMarkup = technicalSpecs
		.map((spec) => `
			<div class="product-tech-row">
				<dt>${spec.label}</dt>
				<dd${spec.key ? ` data-tech-key="${spec.key}"` : ''}>${spec.value}</dd>
			</div>
		`)
		.join('');
	const reviewBreakdownMarkup = reviewData.breakdown
		.map((item) => `
			<div class="product-review-bar" role="listitem" aria-label="${item.star} sao ${item.percent}%">
				<span class="product-review-star-label"><span class="star-icon">${item.star} ★</span></span>
				<span class="product-review-track"><span class="product-review-fill" style="width:${item.percent}%"></span></span>
				<span class="product-review-percent">${item.percent}%</span>
			</div>
		`)
		.join('');
	
	const reviewImageSamples = galleryImages.slice(0, 3);
	
	const reviewImagesMarkup = reviewImageSamples.length > 0
		? `
			<div class="product-review-images">
				${reviewImageSamples.map((img, idx) => `
					<div class="product-review-image-thumb">
						<img src="${img}" alt="Review ${idx + 1}" loading="lazy" onerror="this.style.opacity='0'">
					</div>
				`).join('')}
			</div>
		`
		: '';
	
	const reviewFilterMarkup = `
		<div class="product-review-filters" role="tablist" aria-label="Lọc đánh giá theo số sao">
			<button type="button" class="product-review-filter-btn active" data-review-filter="all">Tất cả (${reviewData.reviews.length})</button>
			${reviewData.ratingCounts
				.map((item) => `<button type="button" class="product-review-filter-btn" data-review-filter="${item.star}">${item.star} sao (${item.count})</button>`)
				.join('')}
		</div>
	`;
	
	const reviewListMarkup = reviewData.reviews
		.map((review) => `
			<article class="product-review-item" data-review-rating="${review.rating}">
				<div class="product-review-item-head">
					<p class="product-review-name">${escapeHtml(review.name)}</p>
					<time class="product-review-time">${escapeHtml(review.display_time)}</time>
				</div>
				<p class="product-review-text">${escapeHtml(review.text)}</p>
			</article>
		`)
		.join('');
		
	const reviewSectionMarkup = `
		<section class="product-detail-reviews section-sm" aria-label="Đánh giá sản phẩm">
			<div class="product-review-spec">
				<div class="product-review-head">
					<h2>Đánh giá sản phẩm</h2>
				</div>
				
				<div class="product-review-summary">
					<div class="product-review-score-section">
						<div class="product-review-score-large">
							<span class="score-star">★</span>
							<span class="score-number">${reviewData.rating.toFixed(1)}</span>
							<span class="score-max">/5</span>
						</div>
						<p class="product-review-customer-count">${(reviewData.reviewCount * 1.5).toFixed(1)}k khách hài lòng</p>
						<p class="product-review-total-count">${reviewData.reviewCount.toLocaleString('vi-VN')} đánh giá</p>
					</div>
					
					<div class="product-review-breakdown" role="list" aria-label="Phân bổ đánh giá theo sao">
						${reviewBreakdownMarkup}
					</div>
					
					${reviewImagesMarkup}
				</div>
				
				${reviewFilterMarkup}
				
				<div class="product-review-list" aria-label="Nhận xét nổi bật từ khách hàng">
					${reviewListMarkup}
				</div>
				<p class="product-review-empty" data-review-empty ${reviewData.reviews.length ? 'hidden' : ''}>Không có đánh giá phù hợp với bộ lọc này.</p>
			</div>
		</section>
	`;

	const relatedMarkup = relatedProducts.length
		? `
			<section class="product-detail-related section-sm">
				<div class="section-header">
					<div>
						<h2 class="section-title">Sản phẩm liên quan</h2>
						<span class="section-accent"></span>
					</div>
				</div>
				<div class="product-grid" data-section-slug="${productEntry.sectionSlug}">
					${relatedProducts.map((item) => renderProductCard(item)).join('')}
				</div>
			</section>
		`
		: '';

	return `
		<section class="product-page section" data-section-slug="${productEntry.sectionSlug}">
			<div class="product-page-head">
				<button type="button" class="btn btn-secondary category-back-btn" data-route="category" data-category="${productEntry.sectionSlug}">
					<i data-lucide="arrow-left"></i>
					Quay lại ${productEntry.sectionTitle}
				</button>
			</div>
			<article class="product-detail-shell">
				<div class="product-detail-media">
					<div class="product-detail-image-wrap">
						<img src="${mainImage}" alt="${productEntry.title}" class="product-detail-image" data-detail-main-image onerror="this.style.opacity='0'">
					</div>
					${galleryThumbMarkup}
				</div>
				<div class="product-detail-info">
					<div class="product-variant-picker" data-variant-picker data-variants="${variantPayload}" data-selected-variant-id="${selectedVariant?.id || ''}">
					<p class="product-detail-kicker">${productEntry.sectionTitle}</p>
					<h1 class="product-detail-title">${productEntry.title}</h1>
					<div class="product-detail-rating">★ ${reviewData.rating.toFixed(1)} <span>(${reviewData.reviewCount.toLocaleString('vi-VN')} đánh giá)</span></div>
					<div class="product-detail-price-block">
						<p class="product-detail-price" data-detail-price-sale>${selectedPrice}</p>
						${discountMarkup}
					</div>
					${variantStorageMarkup}
					${variantColorMarkup}
					<p class="variant-current" data-variant-current>${selectedVariant ? `SKU ${selectedVariant.sku} • Còn ${selectedVariant.quantity} sản phẩm` : ''}</p>
					<p class="product-detail-desc">Sản phẩm chính hãng Apple tại iLuxury, hỗ trợ bảo hành minh bạch và giao hàng nhanh toàn quốc.</p>
					<div class="product-detail-specs">
						${specChips.map((chip) => `<span class="product-detail-chip">${chip}</span>`).join('')}
					</div>
					<div class="product-detail-actions">
						<button type="button" class="btn btn-primary product-detail-add-btn" data-product-title="${escapeAttribute(productEntry.title || 'Sản phẩm')}" data-product-price="${escapeAttribute(selectedPrice || '0₫')}" data-product-image="${escapeAttribute(mainImage || '')}" data-product-original-price="${escapeAttribute(originalPrice || '')}" data-product-sku="${escapeAttribute(selectedVariant?.sku || '')}">Thêm vào giỏ</button>
						<button type="button" class="btn btn-secondary" data-route="category" data-category="${productEntry.sectionSlug}">Xem thêm cùng danh mục</button>
					</div>
					<section class="product-tech-spec" aria-label="Thông tin kỹ thuật sản phẩm">
						<h2>Thông tin kỹ thuật</h2>
						<dl class="product-tech-grid">
							${technicalSpecsMarkup}
						</dl>
					</section>
					</div>
				</div>
			</article>
			${reviewSectionMarkup}
			${relatedMarkup}
		</section>
	`;
}

function renderProductNotFound(slug) {
	return `
		<section class="product-page section">
			<div class="product-page-head">
				<button type="button" class="btn btn-secondary category-back-btn" data-route="home">
					<i data-lucide="arrow-left"></i>
					Quay lại trang chủ
				</button>
			</div>
			<div class="category-page-head">
				<p class="category-page-kicker">Chi tiết sản phẩm</p>
				<h1 class="category-page-title">Không tìm thấy sản phẩm</h1>
				<p class="category-page-desc">Sản phẩm "${slug}" không tồn tại hoặc đã được gỡ khỏi danh mục.</p>
			</div>
		</section>
	`;
}

function calcSavings(originalPrice, salePrice) {
	const original = parseInt(String(originalPrice).replace(/[^\d]/g, ''), 10);
	const sale = parseInt(String(salePrice).replace(/[^\d]/g, ''), 10);

	if (Number.isNaN(original) || Number.isNaN(sale) || original <= sale) {
		return '0đ';
	}

	return `${new Intl.NumberFormat('vi-VN').format(original - sale)}đ`;
}

function renderPromoBanners() {
	return `
		<section class="promo-grid">
			<article class="promo-card promo-card-large">
				<img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1400" alt="Ưu đãi MacBook tại iLuxury">
				<div class="promo-overlay">
					<p class="promo-kicker">Ưu đãi doanh nhân</p>
					<h3>MacBook Pro M3 ưu đãi đặc quyền tháng này</h3>
					<a href="#" class="btn btn-primary">Mua ngay</a>
				</div>
			</article>
			<div class="promo-stack">
				<article class="promo-card">
					<img src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=900" alt="Ưu đãi iPhone đổi mới">
					<div class="promo-overlay">
						<p class="promo-kicker">Thu cũ đổi mới</p>
						<h3>Lên đời iPhone với trợ giá đến 8 triệu</h3>
					</div>
				</article>
				<article class="promo-card">
					<img src="https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?auto=format&fit=crop&q=80&w=900" alt="Combo phụ kiện cao cấp">
					<div class="promo-overlay">
						<p class="promo-kicker">Combo tiết kiệm</p>
						<h3>AirPods + Phụ kiện chính hãng giảm thêm 10%</h3>
					</div>
				</article>
			</div>
		</section>
	`;
}

function renderTrustSection() {
	const trustItems = [
		{ icon: 'award', title: 'Chính hãng 100%', text: 'Apple chính hãng, đầy đủ chứng từ và xuất xứ rõ ràng.' },
		{ icon: 'shield-check', title: 'Bảo hành 12 tháng', text: 'Hỗ trợ kỹ thuật nhanh, chính sách bảo hành minh bạch.' },
		{ icon: 'truck', title: 'Giao nhanh 4 giờ', text: 'Giao tốc độ cao tại nội thành, đóng gói bảo mật cao.' },
		{ icon: 'refresh-cw', title: '1 đổi 1 trong 30 ngày', text: 'Áp dụng lỗi phần cứng theo chính sách tiêu chuẩn iLuxury.' }
	];

	return `
		<section class="trust-section">
			${renderSectionHeader('Tại Sao Chọn iLuxury')}
			<div class="trust-grid">
				${trustItems
					.map(
						(item) => `
							<article class="trust-item">
								<div class="trust-icon"><i data-lucide="${item.icon}"></i></div>
								<h3>${item.title}</h3>
								<p>${item.text}</p>
							</article>
						`
					)
					.join('')}
			</div>
		</section>
	`;
}

function renderTestimonials() {
	const feedbacks = [
		{ name: 'Minh Anh', role: 'Khách hàng thân thiết', rating: 5, text: 'Tư vấn rất chuyên sâu, sản phẩm chuẩn mới nguyên seal và giao cực nhanh.' },
		{ name: 'Tuấn Khang', role: 'Doanh nhân', rating: 5, text: 'Mua MacBook cho team tại iLuxury nhiều lần, dịch vụ luôn ổn định và chuyên nghiệp.' },
		{ name: 'Khánh Linh', role: 'Content Creator', rating: 5, text: 'Đổi iPhone và mua thêm AirPods rất tiện. Hỗ trợ trả góp rõ ràng, minh bạch.' }
	];

	return `
		<section class="testimonial-section">
			${renderSectionHeader('Đánh Giá Khách Hàng')}
			<div class="testimonial-carousel" id="testimonial-carousel">
				<button class="testimonial-nav prev" type="button" aria-label="Đánh giá trước">‹</button>
				<div class="testimonial-track-wrap">
					<div class="testimonial-track" id="testimonial-track">
				${feedbacks
					.map(
						(item, index) => `
							<article class="testimonial-card${index === 0 ? ' active' : ''}">
								<div class="quote-mark">“</div>
								<p class="testimonial-text">${item.text}</p>
								<div class="testimonial-stars">${'★'.repeat(item.rating)}</div>
								<div class="testimonial-author">
									<strong>${item.name}</strong>
									<span>${item.role}</span>
								</div>
							</article>
						`
					)
					.join('')}
					</div>
				</div>
				<button class="testimonial-nav next" type="button" aria-label="Đánh giá tiếp theo">›</button>
			</div>
			<div class="testimonial-dots" id="testimonial-dots"></div>
		</section>
	`;
}

function renderProductCardSkeleton() {
	return `
		<article class="product-card skeleton-card">
			<div class="skeleton skeleton-image"></div>
			<div class="skeleton skeleton-title"></div>
			<div class="skeleton skeleton-text"></div>
			<div class="skeleton skeleton-price"></div>
			<div class="skeleton skeleton-button"></div>
		</article>
	`;
}

function renderSectionSkeleton(title, count = 4) {
	return `
		<section class="category-section">
			${renderSectionHeader(title)}
			<div class="product-grid">
				${Array.from({ length: count }).map(() => renderProductCardSkeleton()).join('')}
			</div>
		</section>
	`;
}

function applyInitialSkeletonState() {
	const featuredRoot = document.getElementById('featured-section-root');
	const flashSaleRoot = document.getElementById('flash-sale-root');
	const productSectionsRoot = document.getElementById('product-sections-root');
	const promoBannersRoot = document.getElementById('promo-banners-root');
	const trustSectionRoot = document.getElementById('trust-section-root');
	const testimonialSectionRoot = document.getElementById('testimonial-section-root');

	if (featuredRoot) {
		featuredRoot.innerHTML = renderSectionSkeleton('Sản Phẩm Bán Chạy', 3);
	}
	if (flashSaleRoot) {
		flashSaleRoot.innerHTML = renderSectionSkeleton('Flash Sale', 4);
	}
	if (productSectionsRoot) {
		productSectionsRoot.innerHTML = renderSectionSkeleton('Sản phẩm', 8);
	}
	if (promoBannersRoot) {
		promoBannersRoot.innerHTML = '<div class="skeleton-banner-grid"><div class="skeleton skeleton-banner-large"></div><div class="skeleton-banner-stack"><div class="skeleton skeleton-banner-small"></div><div class="skeleton skeleton-banner-small"></div></div></div>';
	}
	if (trustSectionRoot) {
		trustSectionRoot.innerHTML = '<div class="trust-grid">' + Array.from({ length: 4 }).map(() => '<div class="skeleton skeleton-trust"></div>').join('') + '</div>';
	}
	if (testimonialSectionRoot) {
		testimonialSectionRoot.innerHTML = '<div class="testimonial-grid">' + Array.from({ length: 3 }).map(() => '<div class="skeleton skeleton-testimonial"></div>').join('') + '</div>';
	}
}

function initHeroSlider() {
	const slides = Array.from(document.querySelectorAll('.hero-slide'));
	const dotsRoot = document.getElementById('hero-dots-root');

	if (!slides.length || !dotsRoot) {
		return;
	}

	let activeIndex = 0;
	let autoplayId = null;
	let touchStartX = 0;
	let touchEndX = 0;

	dotsRoot.innerHTML = slides
		.map((_, index) => `<button class="hero-dot${index === 0 ? ' active' : ''}" data-index="${index}" aria-label="Slide ${index + 1}"></button>`)
		.join('');

	const dots = Array.from(dotsRoot.querySelectorAll('.hero-dot'));

	const activateSlide = (nextIndex) => {
		slides.forEach((slide, index) => {
			slide.classList.toggle('active', index === nextIndex);
		});
		dots.forEach((dot, index) => {
			dot.classList.toggle('active', index === nextIndex);
		});
		activeIndex = nextIndex;
	};

	dots.forEach((dot) => {
		dot.addEventListener('click', () => {
			activateSlide(Number(dot.dataset.index));
		});
	});

	const startAutoplay = () => {
		if (autoplayId) {
			return;
		}
		autoplayId = setInterval(() => {
			activateSlide((activeIndex + 1) % slides.length);
		}, 5000);
	};

	const stopAutoplay = () => {
		if (!autoplayId) {
			return;
		}
		clearInterval(autoplayId);
		autoplayId = null;
	};

	const sliderRoot = document.getElementById('hero-slider-root');
	if (sliderRoot) {
		sliderRoot.addEventListener('mouseenter', stopAutoplay);
		sliderRoot.addEventListener('mouseleave', startAutoplay);
		sliderRoot.addEventListener('touchstart', (e) => {
			touchStartX = e.changedTouches[0].clientX;
		});
		sliderRoot.addEventListener('touchend', (e) => {
			touchEndX = e.changedTouches[0].clientX;
			const delta = touchEndX - touchStartX;
			if (Math.abs(delta) < 45) {
				return;
			}
			if (delta < 0) {
				activateSlide((activeIndex + 1) % slides.length);
			} else {
				activateSlide((activeIndex - 1 + slides.length) % slides.length);
			}
		});
	}

	startAutoplay();
}

function initFlashTimer() {
	const timerEl = document.getElementById('flash-timer');
	if (!timerEl) {
		return;
	}

	let remainingSeconds = 2 * 3600 + 34 * 60 + 17;

	const formatTimer = (seconds) => {
		const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
		const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
		const secs = String(seconds % 60).padStart(2, '0');
		return `${hrs} : ${mins} : ${secs}`;
	};

	timerEl.textContent = `Kết thúc sau: ${formatTimer(remainingSeconds)}`;

	setInterval(() => {
		remainingSeconds = Math.max(remainingSeconds - 1, 0);
		timerEl.textContent = `Kết thúc sau: ${formatTimer(remainingSeconds)}`;
	}, 1000);
}

async function loadSiteData() {
	try {
		return await getSiteData();
	} catch (error) {
		console.warn('Mock API is unavailable, using local data fallback.', error);
		return localSiteData;
	}
}

function getAuthState() {
	let auth = null;
	let profile = null;

	try {
		const authRaw = localStorage.getItem('iluxury_auth');
		auth = authRaw ? JSON.parse(authRaw) : null;
	} catch {
		auth = null;
	}

	try {
		const profileRaw = localStorage.getItem('iluxury_profile');
		profile = profileRaw ? JSON.parse(profileRaw) : null;
	} catch {
		profile = null;
	}

	const isAuthenticated = Boolean(auth?.isAuthenticated);
	const displayName = profile?.fullName || auth?.email || 'Tài khoản';

	return {
		isAuthenticated,
		displayName
	};
}

function savePendingAuthRoute(target = {}) {
	const page = toCategorySlug(target.page || '');
	if (!page || page === 'login' || page === 'register') {
		return;
	}

	const payload = {
		page,
		id: target.id ? String(target.id) : '',
		createdAt: new Date().toISOString()
	};

	try {
		localStorage.setItem(AUTH_PENDING_ROUTE_KEY, JSON.stringify(payload));
	} catch {
		// Ignore storage errors in private mode or quota pressure.
	}
}

function setupDropdowns() {
	const cartDropdownBtn = document.querySelector('[data-dropdown="cart"] .header-action-btn');
	const accountDropdownBtn = document.querySelector('[data-dropdown="account"] .header-action-btn');
	const cartContent = document.getElementById('cart-dropdown');
	const accountContent = document.getElementById('account-dropdown');

	if (!cartDropdownBtn || !accountDropdownBtn) return;

	// Update cart dropdown on initialization
	updateCartDropdown(cartContent);

	// Cart dropdown toggle
	cartDropdownBtn.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		const isActive = cartContent.classList.contains('active');
		closeAllDropdowns();
		if (!isActive) {
			cartContent.classList.add('active');
		}
	});

	// Account dropdown toggle
	accountDropdownBtn.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		const isActive = accountContent.classList.contains('active');
		closeAllDropdowns();
		if (!isActive) {
			accountContent.innerHTML = renderAccountDropdown(getAuthState());
			accountContent.classList.add('active');
			if (window.lucide) {
				window.lucide.createIcons();
			}
			setupAccountMenuHandlers(accountContent);
		}
	});

	// Close dropdowns on document click
	document.addEventListener('click', (e) => {
		if (!e.target.closest('.header-action-dropdown')) {
			closeAllDropdowns();
		}
	});

	// Prevent closing when clicking inside dropdown
	cartContent.addEventListener('click', (e) => e.stopPropagation());
	accountContent.addEventListener('click', (e) => e.stopPropagation());

	// Cart item handlers
	cartContent.addEventListener('click', (e) => {
		if (e.target.closest('.qty-increase')) {
			const itemId = e.target.closest('.qty-increase').dataset.itemId;
			const item = cartManager.getItems().find(i => i.id == itemId);
			if (item) {
				cartManager.updateQuantity(itemId, item.quantity + 1);
				updateCartDropdown(cartContent);
			}
		}

		if (e.target.closest('.qty-decrease')) {
			const itemId = e.target.closest('.qty-decrease').dataset.itemId;
			const item = cartManager.getItems().find(i => i.id == itemId);
			if (item && item.quantity > 1) {
				cartManager.updateQuantity(itemId, item.quantity - 1);
				updateCartDropdown(cartContent);
			}
		}

		if (e.target.closest('.cart-item-remove')) {
			const itemId = e.target.closest('.cart-item-remove').dataset.itemId;
			cartManager.removeItem(itemId);
			updateCartDropdown(cartContent);
		}

		if (e.target.closest('.btn-checkout')) {
			if (typeof window.__iluxuryNavigate === 'function') {
				window.__iluxuryNavigate({ page: 'checkout' });
			} else {
				window.location.href = './checkout.html';
			}
		}
	});
}

function updateCartDropdown(container) {
	const items = cartManager.getItems();
	container.innerHTML = renderCartDropdown(items);
	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
	const cartBtn = document.querySelector('[data-dropdown="cart"] .header-action-btn');
	if (cartBtn) {
		cartBtn.setAttribute('aria-label', `Giỏ hàng, ${totalItems} sản phẩm`);
	}
	const cartCountEl = document.getElementById('cart-count');
	if (cartCountEl) {
		cartCountEl.textContent = totalItems;
		cartCountEl.classList.toggle('is-empty', totalItems === 0);
	}
	const mobileCartCountEl = document.getElementById('mobile-cart-count');
	if (mobileCartCountEl) {
		mobileCartCountEl.textContent = totalItems;
	}
	if (window.lucide) {
		window.lucide.createIcons();
	}
}

function setupSearchOverlay(siteData) {
	const openTrigger = document.querySelector('.search-trigger');
	const overlay = document.getElementById('search-overlay');
	const closeBtn = document.getElementById('search-close');
	const input = document.getElementById('search-input');
	const results = document.getElementById('search-results');
	const chips = Array.from(document.querySelectorAll('.search-chip'));

	if (!openTrigger || !overlay || !closeBtn || !input || !results) {
		return;
	}

	const productPool = siteData.productSections.flatMap((section) => section.products);

	const openOverlay = () => {
		overlay.classList.add('active');
		overlay.setAttribute('aria-hidden', 'false');
		document.body.classList.add('menu-open');
		setTimeout(() => input.focus(), 30);
		renderSearchResults('');
	};

	const closeOverlay = () => {
		overlay.classList.remove('active');
		overlay.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('menu-open');
		input.value = '';
	};

	const renderSearchResults = (query) => {
		const keyword = query.trim().toLowerCase();
		const list = keyword
			? productPool.filter((item) => item.title.toLowerCase().includes(keyword)).slice(0, 6)
			: productPool.slice(0, 6);

		if (!list.length) {
			results.innerHTML = '<p class="search-empty">Không tìm thấy sản phẩm phù hợp.</p>';
			return;
		}

		results.innerHTML = list
			.map((item) => `
				<article class="search-result-item">
					<img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.opacity='0'">
					<div>
						<h4>${item.title}</h4>
						<p>${item.price}</p>
					</div>
				</article>
			`)
			.join('');
	};

	openTrigger.addEventListener('click', openOverlay);
	closeBtn.addEventListener('click', closeOverlay);

	input.addEventListener('input', () => {
		renderSearchResults(input.value);
	});

	chips.forEach((chip) => {
		chip.addEventListener('click', () => {
			input.value = chip.textContent || '';
			renderSearchResults(input.value);
		});
	});

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			closeOverlay();
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			closeOverlay();
		}
	});
}

function setupMobileMenu() {
	const menuBtn = document.querySelector('.mobile-menu-btn');
	const closeBtn = document.querySelector('.mobile-menu-close');
	const nav = document.querySelector('.nav-links');

	if (!menuBtn || !nav) {
		return;
	}

	const closeMenu = () => {
		nav.classList.remove('open');
		menuBtn.classList.remove('active');
		document.body.classList.remove('menu-open');
	};

	const toggleMenu = () => {
		const isOpen = nav.classList.toggle('open');
		menuBtn.classList.toggle('active', isOpen);
		document.body.classList.toggle('menu-open', isOpen);
	};

	menuBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		toggleMenu();
	});

	closeBtn?.addEventListener('click', closeMenu);

	nav.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', closeMenu);
	});

	document.addEventListener('click', (e) => {
		if (!nav.classList.contains('open')) {
			return;
		}

		if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
			closeMenu();
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			closeMenu();
		}
	});
}

function setupHeaderOnScroll() {
	const header = document.querySelector('header');
	if (!header) {
		return;
	}

	let lastScrollY = Math.max(window.scrollY, 0);
	const hideThreshold = 140;
	const minDelta = 8;

	const updateHeaderState = () => {
		const currentY = Math.max(window.scrollY, 0);
		header.classList.toggle('header-scrolled', currentY > 60);

		if (currentY <= 20) {
			header.classList.remove('header-hidden');
			lastScrollY = currentY;
			return;
		}

		const delta = currentY - lastScrollY;
		if (Math.abs(delta) < minDelta) {
			return;
		}

		if (delta > 0 && currentY > hideThreshold) {
			header.classList.add('header-hidden');
		} else if (delta < 0) {
			header.classList.remove('header-hidden');
		}

		lastScrollY = currentY;
	};

	updateHeaderState();
	window.addEventListener('scroll', updateHeaderState, { passive: true });
}

function closeAllDropdowns() {
	document.querySelectorAll('.dropdown-content').forEach(el => {
		el.classList.remove('active');
	});
}

function setupProductCardActions() {
	document.addEventListener('click', (e) => {
		const detailAddBtn = e.target.closest('.product-detail-add-btn');
		if (detailAddBtn) {
			const productTitle = detailAddBtn.dataset.productTitle || 'Sản phẩm';
			const productSku = detailAddBtn.dataset.productSku || '';
			const product = {
				id: `prd-${toCategorySlug(productTitle)}-${toCategorySlug(productSku || 'default')}`,
				title: productTitle,
				price: detailAddBtn.dataset.productPrice || '0₫',
				originalPrice: detailAddBtn.dataset.productOriginalPrice || '',
				image: detailAddBtn.dataset.productImage || ''
			};

			cartManager.addItem(product);
			const cartContainer = document.getElementById('cart-dropdown');
			if (cartContainer) {
				updateCartDropdown(cartContainer);
			}
			showToast(`Đã thêm ${product.title} vào giỏ hàng`, 'success');
			return;
		}

		const addBtn = e.target.closest('.card-add-btn');
		if (addBtn) {
			const card = addBtn.closest('.product-card');
			if (!card) {
				return;
			}

			const productTitle = card.dataset.productTitle || 'Sản phẩm';
			const cardSectionSlug = card.closest('[data-section-slug]')?.dataset.sectionSlug || '';

			const product = {
				id: `prd-${toCategorySlug(productTitle)}-${toCategorySlug(cardSectionSlug || 'default')}`,
				title: productTitle,
				price: card.dataset.productPrice || '0₫',
				originalPrice: card.dataset.productOriginalPrice || '',
				image: card.dataset.productImage || ''
			};

			cartManager.addItem(product);
			const cartContainer = document.getElementById('cart-dropdown');
			if (cartContainer) {
				updateCartDropdown(cartContainer);
			}
			showToast(`Đã thêm ${product.title} vào giỏ hàng`, 'success');
			return;
		}

		const wishBtn = e.target.closest('.card-wishlist-btn');
		if (wishBtn) {
			wishBtn.classList.toggle('active');
			wishBtn.textContent = wishBtn.classList.contains('active') ? '♥' : '♡';
			showToast('Đã cập nhật danh sách yêu thích', 'info');
		}
	});
}

function pickBestVariant(variants, selectedStorage, selectedColor, preferredId = '') {
	if (!variants.length) {
		return null;
	}

	const byBoth = variants.find((item) => {
		const storageOk = selectedStorage ? Number(item.storage) === Number(selectedStorage) : true;
		const colorOk = selectedColor ? String(item.color) === String(selectedColor) : true;
		return storageOk && colorOk;
	});
	if (byBoth) {
		return byBoth;
	}

	if (selectedStorage) {
		const byStorage = variants.find((item) => Number(item.storage) === Number(selectedStorage));
		if (byStorage) {
			return byStorage;
		}
	}

	if (selectedColor) {
		const byColor = variants.find((item) => String(item.color) === String(selectedColor));
		if (byColor) {
			return byColor;
		}
	}

	const byId = preferredId ? variants.find((item) => item.id === preferredId) : null;
	return byId || variants[0];
}

function applyVariantToProductDetail(picker, variant) {
	if (!picker || !variant) {
		return;
	}

	picker.dataset.selectedVariantId = variant.id || '';
	const salePriceText = formatCurrencyVnd(Number(variant.price) || 0);
	const originalPriceText = Number(variant.original_price) > 0 ? formatCurrencyVnd(Number(variant.original_price)) : '';

	const salePriceEl = picker.querySelector('[data-detail-price-sale]');
	if (salePriceEl) {
		salePriceEl.textContent = salePriceText;
	}

	const originalPriceEl = picker.querySelector('[data-detail-price-original]');
	const savingEl = picker.querySelector('[data-detail-price-saving]');
	if (originalPriceEl) {
		if (originalPriceText) {
			originalPriceEl.hidden = false;
			originalPriceEl.textContent = originalPriceText;
		} else {
			originalPriceEl.hidden = true;
			originalPriceEl.textContent = '';
		}
	}
	if (savingEl) {
		if (originalPriceText) {
			savingEl.hidden = false;
			savingEl.textContent = `Tiết kiệm ${calcSavings(originalPriceText, salePriceText)}`;
		} else {
			savingEl.hidden = true;
			savingEl.textContent = '';
		}
	}

	const skuEl = picker.querySelector('[data-tech-key="sku"]');
	if (skuEl) {
		skuEl.textContent = variant.sku || 'Đang cập nhật';
	}

	const storageEl = picker.querySelector('[data-tech-key="storage"]');
	if (storageEl) {
		storageEl.textContent = Number.isFinite(variant.storage) ? `${variant.storage}GB` : 'Đang cập nhật';
	}

	const ramEl = picker.querySelector('[data-tech-key="ram"]');
	if (ramEl) {
		ramEl.textContent = Number.isFinite(variant.ram) ? `${variant.ram}GB` : 'Đang cập nhật';
	}

	const colorEl = picker.querySelector('[data-tech-key="color"]');
	if (colorEl) {
		colorEl.textContent = variant.color || 'Đang cập nhật';
	}

	const stockStatusEl = picker.querySelector('[data-tech-key="stock_status"]');
	if (stockStatusEl) {
		const qty = Number(variant.quantity);
		stockStatusEl.textContent = Number.isFinite(qty) ? (qty > 0 ? `Còn ${qty} sản phẩm` : 'Hết hàng') : 'Còn hàng';
	}

	const currentEl = picker.querySelector('[data-variant-current]');
	if (currentEl) {
		const qty = Number(variant.quantity);
		const qtyText = Number.isFinite(qty) ? `Còn ${qty} sản phẩm` : 'Còn hàng';
		currentEl.textContent = `SKU ${variant.sku || 'N/A'} • ${qtyText}`;
	}

	const addBtn = picker.querySelector('.product-detail-add-btn');
	if (addBtn) {
		addBtn.dataset.productPrice = salePriceText;
		addBtn.dataset.productOriginalPrice = originalPriceText;
		addBtn.dataset.productSku = variant.sku || '';
		const qty = Number(variant.quantity);
		const isOut = Number.isFinite(qty) && qty <= 0;
		addBtn.disabled = isOut;
		addBtn.textContent = isOut ? 'Hết hàng' : 'Thêm vào giỏ';
	}
}

function syncVariantOptionActiveStates(picker, variant) {
	if (!picker || !variant) {
		return;
	}

	const storageButtons = picker.querySelectorAll('.variant-option-btn[data-option-type="storage"]');
	storageButtons.forEach((btn) => {
		btn.classList.toggle('active', Number(btn.dataset.optionValue) === Number(variant.storage));
	});

	const colorButtons = picker.querySelectorAll('.variant-option-btn[data-option-type="color"]');
	colorButtons.forEach((btn) => {
		btn.classList.toggle('active', String(btn.dataset.optionValue || '') === String(variant.color || ''));
	});
}

function initializeProductVariantPicker(picker) {
	if (!picker) {
		return;
	}

	let variants = [];
	try {
		variants = JSON.parse(picker.dataset.variants || '[]');
	} catch {
		variants = [];
	}

	if (!variants.length) {
		return;
	}

	const initial = pickBestVariant(variants, null, null, picker.dataset.selectedVariantId || '');
	if (!initial) {
		return;
	}

	syncVariantOptionActiveStates(picker, initial);
	applyVariantToProductDetail(picker, initial);
}

function setupProductVariantInteractions() {
	document.addEventListener('click', (event) => {
		const optionBtn = event.target.closest('.variant-option-btn');
		if (!optionBtn) {
			return;
		}

		const picker = optionBtn.closest('[data-variant-picker]');
		if (!picker) {
			return;
		}

		let variants = [];
		try {
			variants = JSON.parse(picker.dataset.variants || '[]');
		} catch {
			variants = [];
		}

		if (!variants.length) {
			return;
		}

		const storageActive = optionBtn.dataset.optionType === 'storage'
			? optionBtn.dataset.optionValue
			: picker.querySelector('.variant-option-btn[data-option-type="storage"].active')?.dataset.optionValue;
		const colorActive = optionBtn.dataset.optionType === 'color'
			? optionBtn.dataset.optionValue
			: picker.querySelector('.variant-option-btn[data-option-type="color"].active')?.dataset.optionValue;

		const variant = pickBestVariant(variants, storageActive || null, colorActive || null, picker.dataset.selectedVariantId || '');
		if (!variant) {
			return;
		}

		syncVariantOptionActiveStates(picker, variant);
		applyVariantToProductDetail(picker, variant);
	});
}

function initializeAllProductVariantPickers(scope = document) {
	scope.querySelectorAll('[data-variant-picker]').forEach((picker) => {
		initializeProductVariantPicker(picker);
	});
}

function setupProductGalleryInteractions() {
	document.addEventListener('click', (event) => {
		const thumbBtn = event.target.closest('[data-detail-thumb]');
		if (!thumbBtn) {
			return;
		}

		const mediaRoot = thumbBtn.closest('.product-detail-media');
		if (!mediaRoot) {
			return;
		}

		const nextImage = thumbBtn.dataset.imageSrc || '';
		if (!nextImage) {
			return;
		}

		mediaRoot.querySelectorAll('[data-detail-thumb]').forEach((btn) => {
			btn.classList.toggle('active', btn === thumbBtn);
		});

		const mainImage = mediaRoot.querySelector('[data-detail-main-image]');
		if (mainImage) {
			mainImage.src = nextImage;
		}

		const detailRoot = mediaRoot.closest('.product-detail-shell');
		const addBtn = detailRoot?.querySelector('.product-detail-add-btn');
		if (addBtn) {
			addBtn.dataset.productImage = nextImage;
		}
	});
}

function setupProductReviewFilterInteractions() {
	document.addEventListener('click', (event) => {
		const filterBtn = event.target.closest('.product-review-filter-btn[data-review-filter]');
		if (!filterBtn) {
			return;
		}

		const reviewSpec = filterBtn.closest('.product-review-spec');
		if (!reviewSpec) {
			return;
		}

		const filterValue = filterBtn.dataset.reviewFilter || 'all';
		reviewSpec.querySelectorAll('.product-review-filter-btn[data-review-filter]').forEach((button) => {
			button.classList.toggle('active', button === filterBtn);
		});

		let visibleCount = 0;
		reviewSpec.querySelectorAll('.product-review-item[data-review-rating]').forEach((item) => {
			const itemRating = Number(item.dataset.reviewRating || 0);
			const isVisible = filterValue === 'all' || itemRating === Number(filterValue);
			item.hidden = !isVisible;
			if (isVisible) {
				visibleCount += 1;
			}
		});

		const emptyState = reviewSpec.querySelector('[data-review-empty]');
		if (emptyState) {
			emptyState.hidden = visibleCount > 0;
		}
	});
}

function escapeAttribute(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function showToast(message, type = 'info') {
	const region = document.getElementById('toast-region');
	if (!region) {
		return;
	}

	const toast = document.createElement('div');
	toast.className = `toast toast-${type}`;
	toast.textContent = message;
	region.appendChild(toast);

	requestAnimationFrame(() => {
		toast.classList.add('is-visible');
	});

	setTimeout(() => {
		toast.classList.remove('is-visible');
		setTimeout(() => toast.remove(), 250);
	}, 3000);
}

function setupRevealAnimations() {
	const targets = document.querySelectorAll('.section, .section-sm, .category-section, .promo-grid, .trust-section, .testimonial-section');
	if (!targets.length) {
		return;
	}

	const revealAll = () => {
		targets.forEach((target) => {
			target.classList.remove('reveal-pending');
			target.classList.add('revealed');
		});
	};

	if (!('IntersectionObserver' in window)) {
		revealAll();
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.remove('reveal-pending');
				entry.target.classList.add('revealed');
				observer.unobserve(entry.target);
			}
		});
	}, {
		threshold: 0.05,
		rootMargin: '0px 0px -10% 0px'
	});

	targets.forEach((target) => {
		target.classList.add('reveal-pending');
		observer.observe(target);

		const rect = target.getBoundingClientRect();
		if (rect.top < window.innerHeight * 0.92) {
			target.classList.remove('reveal-pending');
			target.classList.add('revealed');
			observer.unobserve(target);
		}
	});

	setTimeout(revealAll, 1200);
}

function setupTestimonialCarousel() {
	const track = document.getElementById('testimonial-track');
	const dotsRoot = document.getElementById('testimonial-dots');
	const prevBtn = document.querySelector('.testimonial-nav.prev');
	const nextBtn = document.querySelector('.testimonial-nav.next');

	if (!track || !dotsRoot || !prevBtn || !nextBtn) {
		return;
	}

	const cards = Array.from(track.querySelectorAll('.testimonial-card'));
	if (!cards.length) {
		return;
	}

	let activeIndex = 0;
	let autoplayId = null;

	dotsRoot.innerHTML = cards
		.map((_, index) => `<button class="testimonial-dot${index === 0 ? ' active' : ''}" data-index="${index}" aria-label="Đến đánh giá ${index + 1}"></button>`)
		.join('');

	const dots = Array.from(dotsRoot.querySelectorAll('.testimonial-dot'));

	const activate = (nextIndex) => {
		cards.forEach((card, index) => {
			card.classList.toggle('active', index === nextIndex);
		});
		dots.forEach((dot, index) => {
			dot.classList.toggle('active', index === nextIndex);
		});
		activeIndex = nextIndex;
	};

	prevBtn.addEventListener('click', () => {
		activate((activeIndex - 1 + cards.length) % cards.length);
	});

	nextBtn.addEventListener('click', () => {
		activate((activeIndex + 1) % cards.length);
	});

	dots.forEach((dot) => {
		dot.addEventListener('click', () => {
			activate(Number(dot.dataset.index));
		});
	});

	const start = () => {
		if (autoplayId) {
			return;
		}
		autoplayId = setInterval(() => {
			activate((activeIndex + 1) % cards.length);
		}, 5000);
	};

	const stop = () => {
		if (!autoplayId) {
			return;
		}
		clearInterval(autoplayId);
		autoplayId = null;
	};

	const carousel = document.getElementById('testimonial-carousel');
	carousel?.addEventListener('mouseenter', stop);
	carousel?.addEventListener('mouseleave', start);
	start();
}

function setupAccountMenuHandlers(container) {
	const accountInfoBtn = container.querySelector('.account-info');
	const changePasswordBtn = container.querySelector('.change-password');
	const orderHistoryBtn = container.querySelector('.order-history');
	const loginBtn = container.querySelector('.account-login');
	const registerBtn = container.querySelector('.account-register');
	const logoutBtn = container.querySelector('.logout');

	accountInfoBtn?.addEventListener('click', (e) => {
		closeAllDropdowns();
	});

	changePasswordBtn?.addEventListener('click', (e) => {
		closeAllDropdowns();
	});

	orderHistoryBtn?.addEventListener('click', (e) => {
		closeAllDropdowns();
	});

	loginBtn?.addEventListener('click', () => {
		closeAllDropdowns();
	});

	registerBtn?.addEventListener('click', () => {
		closeAllDropdowns();
	});

	logoutBtn?.addEventListener('click', (e) => {
		e.preventDefault();
		localStorage.removeItem('iluxury_auth');
		localStorage.removeItem('iluxury_profile');
		showToast('Đã đăng xuất khỏi tài khoản', 'info');
		closeAllDropdowns();
		if (typeof window.__iluxuryNavigate === 'function') {
			window.__iluxuryNavigate({ page: '' });
		} else {
			window.location.href = './index.html';
		}
	});
}

function setupCategoryNavigation(siteData) {
	const heroRoot = document.getElementById('hero-slider-root');
	const homeMainRoot = document.querySelector('.home-main');
	const productSectionsRoot = document.getElementById('product-sections-root');

	if (!productSectionsRoot || !homeMainRoot) {
		return;
	}

	const productCatalog = buildProductCatalog(siteData);
	let categoryViewState = null;
	let productViewState = null;
	let activeSpaPage = '';
	let spaNavigationToken = 0;
	const spaMarkupCache = new Map();

	const categoryPageRoot = document.createElement('div');
	categoryPageRoot.id = 'category-page-root';
	categoryPageRoot.className = 'section';
	categoryPageRoot.hidden = true;
	productSectionsRoot.insertAdjacentElement('afterend', categoryPageRoot);

	const productPageRoot = document.createElement('div');
	productPageRoot.id = 'product-page-root';
	productPageRoot.className = 'section';
	productPageRoot.hidden = true;
	categoryPageRoot.insertAdjacentElement('afterend', productPageRoot);

	const spaPageRoot = document.createElement('div');
	spaPageRoot.id = 'spa-page-root';
	spaPageRoot.className = 'section spa-page-root';
	spaPageRoot.hidden = true;
	homeMainRoot.insertAdjacentElement('afterend', spaPageRoot);

	const spaViewConfig = {
		checkout: {
			title: 'Thanh Toán | iLuxury',
			file: './checkout.html',
			init: () => initCheckoutPage({
				onNavigate: ({ page, id }) => navigateRoute({ page, id }),
				onNotify: (message, type) => showToast(message, type === 'error' ? 'warning' : type)
			})
		},
		'order-confirmation': {
			title: 'Đặt Hàng Thành Công | iLuxury',
			file: './order-confirmation.html',
			init: ({ id }) => initOrderConfirmationPage({ orderId: id })
		},
		'order-history': {
			title: 'Lịch Sử Đơn Hàng | iLuxury',
			file: './order-history.html',
			init: () => initOrderHistoryPage()
		},
		'order-detail': {
			title: 'Chi Tiết Đơn Hàng | iLuxury',
			file: './order-detail.html',
			init: ({ id }) => initOrderDetailPage({ orderId: id })
		},
		'account-profile': {
			title: 'Thông Tin Tài Khoản | iLuxury',
			file: './account-profile.html',
			init: () => initAccountProfilePage({ notify: (message, type) => showToast(message, type === 'error' ? 'warning' : type) })
		},
		'change-password': {
			title: 'Đổi Mật Khẩu | iLuxury',
			file: './change-password.html',
			init: () => initChangePasswordPage({ notify: (message, type) => showToast(message, type === 'error' ? 'warning' : type) })
		},
		login: {
			title: 'Đăng Nhập | iLuxury',
			file: './login.html',
			init: () => initLoginPage({
				notify: (message, type) => showToast(message, type === 'error' ? 'warning' : type),
				onNavigate: (target) => navigateRoute(target)
			})
		},
		register: {
			title: 'Đăng Ký | iLuxury',
			file: './register.html',
			init: () => initRegisterPage({
				notify: (message, type) => showToast(message, type === 'error' ? 'warning' : type),
				onNavigate: (target) => navigateRoute(target)
			})
		}
	};

	const standaloneToSpaMap = {
		'checkout.html': 'checkout',
		'order-confirmation.html': 'order-confirmation',
		'order-history.html': 'order-history',
		'order-detail.html': 'order-detail',
		'account-profile.html': 'account-profile',
		'change-password.html': 'change-password',
		'login.html': 'login',
		'register.html': 'register'
	};

	const AUTH_REQUIRED_PAGES = new Set([
		'checkout',
		'order-confirmation',
		'order-history',
		'order-detail',
		'account-profile',
		'change-password'
	]);

	const setHomeVisibility = (visible) => {
		homeMainRoot.hidden = !visible;
		homeMainRoot.setAttribute('aria-hidden', visible ? 'false' : 'true');
		spaPageRoot.hidden = visible;
		document.body.classList.toggle('is-spa-page', !visible);
	};

	const ensureHeroVisibility = () => {
		if (!heroRoot) {
			return;
		}
		const shouldHide = activeSpaPage || document.body.classList.contains('is-category-page') || document.body.classList.contains('is-product-page');
		heroRoot.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
	};

	const loadSpaMarkup = async (page) => {
		if (spaMarkupCache.has(page)) {
			return spaMarkupCache.get(page);
		}

		const config = spaViewConfig[page];
		if (!config) {
			return { html: '', styles: [] };
		}

		const response = await fetch(config.file, { cache: 'default' });
		if (!response.ok) {
			throw new Error(`Không thể tải giao diện ${page}`);
		}
		const htmlText = await response.text();
		const doc = new DOMParser().parseFromString(htmlText, 'text/html');

		const body = doc.body.cloneNode(true);
		body.querySelectorAll('header, script').forEach((node) => node.remove());
		const styles = Array.from(doc.head.querySelectorAll('style')).map((node) => node.textContent || '').filter(Boolean);
		const payload = {
			html: body.innerHTML,
			styles
		};
		spaMarkupCache.set(page, payload);
		return payload;
	};

	const ensureSpaStyles = (page, styles) => {
		if (!styles.length) {
			return;
		}
		const styleId = `spa-inline-style-${page}`;
		if (document.getElementById(styleId)) {
			return;
		}
		const styleEl = document.createElement('style');
		styleEl.id = styleId;
		styleEl.textContent = styles.join('\n');
		document.head.appendChild(styleEl);
	};

	const renderSpaLoadingState = (page) => {
		if (page === 'checkout') {
			return `
				<section class="section spa-loading-shell">
					<div class="spa-loading-stepper">
						<div class="skeleton spa-loading-circle"></div>
						<div class="skeleton spa-loading-line"></div>
						<div class="skeleton spa-loading-circle"></div>
						<div class="skeleton spa-loading-line"></div>
						<div class="skeleton spa-loading-circle"></div>
					</div>
					<div class="spa-loading-grid">
						<div class="spa-loading-card">
							<div class="skeleton skeleton-title"></div>
							<div class="skeleton skeleton-text"></div>
							<div class="skeleton skeleton-text"></div>
							<div class="skeleton skeleton-text"></div>
							<div class="skeleton skeleton-button"></div>
						</div>
						<div class="spa-loading-card">
							<div class="skeleton skeleton-title"></div>
							<div class="skeleton skeleton-text"></div>
							<div class="skeleton skeleton-text"></div>
							<div class="skeleton skeleton-price"></div>
						</div>
					</div>
				</section>
			`;
		}

		if (page === 'order-history') {
			return `
				<section class="section spa-loading-shell">
					<div class="spa-loading-head">
						<div class="skeleton skeleton-title"></div>
						<div class="skeleton skeleton-text"></div>
					</div>
					<div class="spa-loading-list">
						${Array.from({ length: 3 }).map(() => `
							<div class="spa-loading-card">
								<div class="skeleton skeleton-title"></div>
								<div class="skeleton skeleton-text"></div>
								<div class="skeleton skeleton-text"></div>
							</div>
						`).join('')}
					</div>
				</section>
			`;
		}

		if (page === 'order-detail' || page === 'order-confirmation') {
			return `
				<section class="section spa-loading-shell">
					<div class="spa-loading-head">
						<div class="skeleton skeleton-title"></div>
						<div class="skeleton skeleton-text"></div>
					</div>
					<div class="spa-loading-grid two-column">
						<div class="spa-loading-card">
							<div class="skeleton skeleton-title"></div>
							<div class="skeleton skeleton-text"></div>
							<div class="skeleton skeleton-text"></div>
						</div>
						<div class="spa-loading-card">
							<div class="skeleton skeleton-title"></div>
							<div class="skeleton skeleton-text"></div>
							<div class="skeleton skeleton-text"></div>
						</div>
					</div>
					<div class="spa-loading-card">
						<div class="skeleton skeleton-title"></div>
						<div class="skeleton skeleton-text"></div>
						<div class="skeleton skeleton-text"></div>
						<div class="skeleton skeleton-price"></div>
					</div>
				</section>
			`;
		}

		if (page === 'login' || page === 'register') {
			return `
				<section class="section spa-loading-shell">
					<div class="spa-loading-head">
						<div class="skeleton skeleton-title"></div>
						<div class="skeleton skeleton-text"></div>
					</div>
					<div class="spa-loading-card">
						<div class="skeleton skeleton-text"></div>
						<div class="skeleton skeleton-text"></div>
						<div class="skeleton skeleton-text"></div>
						<div class="skeleton skeleton-button"></div>
					</div>
				</section>
			`;
		}

		return `
			<section class="section spa-loading-shell">
				<div class="spa-loading-head">
					<div class="skeleton skeleton-title"></div>
					<div class="skeleton skeleton-text"></div>
				</div>
				<div class="spa-loading-card">
					<div class="skeleton skeleton-text"></div>
					<div class="skeleton skeleton-text"></div>
					<div class="skeleton skeleton-text"></div>
					<div class="skeleton skeleton-button"></div>
				</div>
			</section>
		`;
	};

	const prefetchSpaMarkup = () => {
		Object.keys(spaViewConfig).forEach((page) => {
			loadSpaMarkup(page).catch(() => {
				// Ignore prefetch errors; page navigation will handle fallback UI.
			});
		});
	};

	const beginSpaRouteTransition = () => {
		spaPageRoot.classList.remove('is-route-ready');
		spaPageRoot.classList.add('is-route-loading');
	};

	const completeSpaRouteTransition = () => {
		window.requestAnimationFrame(() => {
			spaPageRoot.classList.remove('is-route-loading');
			spaPageRoot.classList.add('is-route-ready');
		});
	};

	if (typeof window.requestIdleCallback === 'function') {
		window.requestIdleCallback(prefetchSpaMarkup, { timeout: 2200 });
	} else {
		window.setTimeout(prefetchSpaMarkup, 500);
	}

	const toggleCategoryMode = (enabled) => {
		document.body.classList.toggle('is-category-page', enabled);
		categoryPageRoot.hidden = !enabled;
		ensureHeroVisibility();
	};

	const toggleProductMode = (enabled) => {
		document.body.classList.toggle('is-product-page', enabled);
		productPageRoot.hidden = !enabled;
		ensureHeroVisibility();
	};

	const openHome = ({ replace = false } = {}) => {
		setSpaPageToUrl('', { replace });
		activeSpaPage = '';
		setHomeVisibility(true);
		spaPageRoot.classList.remove('is-route-loading', 'is-route-ready');
		toggleCategoryMode(false);
		toggleProductMode(false);
		categoryPageRoot.innerHTML = '';
		productPageRoot.innerHTML = '';
		spaPageRoot.innerHTML = '';
		categoryViewState = null;
		productViewState = null;
		document.title = DEFAULT_PAGE_TITLE;
		ensureHeroVisibility();
	};

	const renderCategoryView = () => {
		if (!categoryViewState) {
			return;
		}

		const filtered = filterProductsByKey(
			categoryViewState.section.products || [],
			categoryViewState.filters,
			categoryViewState.activeFilterKey
		);

		categoryPageRoot.innerHTML = renderCategoryProductsPage(
			categoryViewState.section,
			categoryViewState.filters,
			categoryViewState.activeFilterKey,
			filtered
		);

		if (window.lucide) {
			window.lucide.createIcons();
		}
	};

	const openCategory = (slug, { pushState = true } = {}) => {
		if (!slug) {
			openHome({ replace: !pushState });
			return;
		}

		const resolvedSlug = resolveCategorySlug(slug);
		const section = findSectionBySlug(siteData, resolvedSlug);
		if (pushState) {
			setCategoryToUrl(resolvedSlug);
		}
		activeSpaPage = '';
		setHomeVisibility(true);
		spaPageRoot.classList.remove('is-route-loading', 'is-route-ready');
		toggleCategoryMode(true);
		toggleProductMode(false);
		spaPageRoot.innerHTML = '';
		productPageRoot.innerHTML = '';
		productViewState = null;

		if (!section) {
			categoryViewState = null;
			categoryPageRoot.innerHTML = renderCategoryNotFound(resolvedSlug);
			document.title = `Không tìm thấy danh mục | iLuxury`;
		} else {
			categoryViewState = {
				section,
				filters: buildCategoryFilters(section),
				activeFilterKey: 'all'
			};
			renderCategoryView();
			document.title = `${section.title} | iLuxury`;
		}

		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const openProduct = (slug, { pushState = true, categoryHint = '' } = {}) => {
		if (!slug) {
			openHome({ replace: !pushState });
			return;
		}

		const resolvedProductSlug = toCategorySlug(slug);
		const resolvedCategorySlug = resolveCategorySlug(categoryHint || getCategoryFromUrl());
		const productEntry = findProductBySlug(productCatalog, resolvedProductSlug, resolvedCategorySlug);

		if (pushState) {
			setProductToUrl(resolvedProductSlug, { categorySlug: productEntry?.sectionSlug || resolvedCategorySlug });
		}

		activeSpaPage = '';
		setHomeVisibility(true);
		spaPageRoot.classList.remove('is-route-loading', 'is-route-ready');
		toggleCategoryMode(false);
		toggleProductMode(true);
		spaPageRoot.innerHTML = '';
		categoryPageRoot.innerHTML = '';
		categoryViewState = null;

		if (!productEntry) {
			productViewState = null;
			productPageRoot.innerHTML = renderProductNotFound(resolvedProductSlug);
			document.title = 'Không tìm thấy sản phẩm | iLuxury';
		} else {
			const relatedProducts = productCatalog
				.filter((item) => item.sectionSlug === productEntry.sectionSlug && item.productSlug !== productEntry.productSlug)
				.slice(0, 4);

			productViewState = { productEntry };
			productPageRoot.innerHTML = renderProductDetailPage(productEntry, relatedProducts);
			initializeAllProductVariantPickers(productPageRoot);
			document.title = `${productEntry.title} | iLuxury`;
		}

		if (window.lucide) {
			window.lucide.createIcons();
		}

		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const openSpaPage = async (page, { pushState = true, id = '' } = {}) => {
		const normalizedPage = toCategorySlug(page || '');
		if (!SPA_PAGES.has(normalizedPage)) {
			openHome({ replace: !pushState });
			return;
		}

		if (AUTH_REQUIRED_PAGES.has(normalizedPage) && !getAuthState().isAuthenticated) {
			savePendingAuthRoute({ page: normalizedPage, id });
			if (pushState) {
				showToast('Vui lòng đăng nhập để tiếp tục.', 'warning');
			}
			if (normalizedPage !== 'login') {
				openSpaPage('login', { pushState: true });
			}
			return;
		}

		if (pushState) {
			setSpaPageToUrl(normalizedPage, { id });
		}

		activeSpaPage = normalizedPage;
		setHomeVisibility(false);
		beginSpaRouteTransition();
		toggleCategoryMode(false);
		toggleProductMode(false);
		categoryPageRoot.innerHTML = '';
		productPageRoot.innerHTML = '';
		categoryViewState = null;
		productViewState = null;
		spaPageRoot.innerHTML = renderSpaLoadingState(normalizedPage);
		document.title = spaViewConfig[normalizedPage]?.title || DEFAULT_PAGE_TITLE;
		ensureHeroVisibility();

		const currentToken = ++spaNavigationToken;

		try {
			const { html, styles } = await loadSpaMarkup(normalizedPage);
			if (currentToken !== spaNavigationToken || activeSpaPage !== normalizedPage) {
				return;
			}

			ensureSpaStyles(normalizedPage, styles);
			spaPageRoot.innerHTML = html;

			const initPage = spaViewConfig[normalizedPage]?.init;
			if (typeof initPage === 'function') {
				initPage({ id });
			}

			if (window.lucide) {
				window.lucide.createIcons();
			}
			completeSpaRouteTransition();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} catch (error) {
			console.error(error);
			spaPageRoot.innerHTML = `
				<section class="section">
					<div class="category-page-head">
						<h1 class="category-page-title">Không thể tải trang</h1>
						<p class="category-page-desc">Vui lòng thử lại sau ít phút.</p>
						<button type="button" class="btn btn-secondary" data-route="home">Về trang chủ</button>
					</div>
				</section>
			`;
			completeSpaRouteTransition();
		}
	};

	const navigateRoute = (target = {}) => {
		if (target.page) {
			openSpaPage(target.page, { id: target.id || '' });
			return;
		}

		if (target.product) {
			openProduct(target.product, { categoryHint: target.category || '' });
			return;
		}

		if (target.category) {
			openCategory(target.category);
			return;
		}

		openHome();
	};

	window.__iluxuryNavigate = navigateRoute;

	const resolveRouteFromAnchor = (anchor) => {
		const href = anchor.getAttribute('href') || '';
		if (!href || href.startsWith('#')) {
			return null;
		}

		let url;
		try {
			url = new URL(href, window.location.href);
		} catch {
			return null;
		}

		if (url.origin !== window.location.origin) {
			return null;
		}

		const fileName = url.pathname.split('/').pop() || '';
		if (standaloneToSpaMap[fileName]) {
			return {
				page: standaloneToSpaMap[fileName],
				id: url.searchParams.get('id') || ''
			};
		}

		const isHomePath = fileName === '' || fileName === 'index.html';
		if (!isHomePath) {
			return null;
		}

		const page = toCategorySlug(url.searchParams.get(SPA_PAGE_PARAM) || '');
		if (SPA_PAGES.has(page)) {
			return {
				page,
				id: url.searchParams.get('id') || ''
			};
		}

		const product = toCategorySlug(url.searchParams.get('product') || '');
		if (product) {
			return {
				product,
				category: resolveCategorySlug(url.searchParams.get('category') || '')
			};
		}

		const category = resolveCategorySlug(url.searchParams.get('category') || '');
		if (category) {
			return { category };
		}

		return { home: true };
	};

	const prefetchByUserIntent = (anchor) => {
		if (!anchor || anchor.dataset.spaIntentPrefetched === '1') {
			return;
		}

		const route = resolveRouteFromAnchor(anchor);
		if (!route?.page) {
			return;
		}

		anchor.dataset.spaIntentPrefetched = '1';
		loadSpaMarkup(route.page).catch(() => {
			anchor.dataset.spaIntentPrefetched = '';
		});
	};

	const logoLink = document.querySelector('.logo');
	if (logoLink) {
		logoLink.setAttribute('href', '#');
		logoLink.addEventListener('click', (event) => {
			event.preventDefault();
			openHome();
		});
	}

	document.querySelectorAll('.nav-links > a').forEach((link) => {
		const label = link.textContent?.trim() || '';
		const slug = resolveCategorySlug(label);
		link.dataset.category = slug;
		link.setAttribute('href', `?category=${slug}`);
	});

	document.addEventListener('click', (event) => {
		const anchor = event.target.closest('a[href]');
		if (anchor && !anchor.hasAttribute('download') && anchor.target !== '_blank') {
			const route = resolveRouteFromAnchor(anchor);
			if (route) {
				event.preventDefault();
				navigateRoute(route);
				return;
			}
		}

		const homeBtn = event.target.closest('[data-route="home"]');
		if (homeBtn) {
			event.preventDefault();
			openHome();
			return;
		}

		const categoryBackBtn = event.target.closest('[data-route="category"]');
		if (categoryBackBtn) {
			event.preventDefault();
			openCategory(categoryBackBtn.dataset.category || '');
			return;
		}

		const filterTarget = event.target.closest('.category-filter-btn[data-filter-key]');
		if (filterTarget && categoryViewState) {
			event.preventDefault();
			categoryViewState.activeFilterKey = filterTarget.dataset.filterKey || 'all';
			renderCategoryView();
			return;
		}

		const categoryTarget = event.target.closest('.btn-view-all[data-category], .category-nav-item[data-category], .nav-links > a[data-category]');
		if (categoryTarget) {
			event.preventDefault();
			openCategory(categoryTarget.dataset.category || '');
			return;
		}

		const addOrWishTarget = event.target.closest('.card-add-btn, .card-wishlist-btn');
		if (addOrWishTarget) {
			return;
		}

		const productCard = event.target.closest('.product-card');
		if (productCard) {
			const productSlug = toCategorySlug(productCard.dataset.productTitle || '');
			if (!productSlug) {
				return;
			}

			const sectionEl = productCard.closest('[data-section-slug]');
			const categoryHintFromCard = sectionEl?.dataset.sectionSlug || productViewState?.productEntry?.sectionSlug || '';
			event.preventDefault();
			openProduct(productSlug, { categoryHint: categoryHintFromCard });
		}
	});

	document.addEventListener('mouseover', (event) => {
		const anchor = event.target.closest('a[href]');
		if (!anchor) {
			return;
		}

		const related = event.relatedTarget;
		if (related instanceof Element && anchor.contains(related)) {
			return;
		}

		prefetchByUserIntent(anchor);
	});

	document.addEventListener('focusin', (event) => {
		const anchor = event.target.closest('a[href]');
		if (!anchor) {
			return;
		}
		prefetchByUserIntent(anchor);
	});

	document.addEventListener('touchstart', (event) => {
		const anchor = event.target.closest('a[href]');
		if (!anchor) {
			return;
		}
		prefetchByUserIntent(anchor);
	}, { passive: true });

	window.addEventListener('popstate', () => {
		const spaMeta = getSpaPageMetaFromUrl();
		if (spaMeta.page) {
			openSpaPage(spaMeta.page, { pushState: false, id: spaMeta.id });
			return;
		}

		const productSlug = getProductFromUrl();
		if (productSlug) {
			openProduct(productSlug, { pushState: false, categoryHint: getCategoryFromUrl() });
			return;
		}

		const categorySlug = getCategoryFromUrl();
		if (!categorySlug) {
			openHome({ replace: true });
			return;
		}
		openCategory(categorySlug, { pushState: false });
	});

	const initialSpaMeta = getSpaPageMetaFromUrl();
	if (initialSpaMeta.page) {
		openSpaPage(initialSpaMeta.page, { pushState: false, id: initialSpaMeta.id });
		return;
	}

	const initialProductSlug = getProductFromUrl();
	if (initialProductSlug) {
		openProduct(initialProductSlug, { pushState: false, categoryHint: getCategoryFromUrl() });
		return;
	}

	const initialCategorySlug = getCategoryFromUrl();
	if (initialCategorySlug) {
		openCategory(initialCategorySlug, { pushState: false });
	}
}

async function init() {
	applyInitialSkeletonState();
	const rawSiteData = await loadSiteData();
	const siteData = normalizeSiteDataByDatabaseSchema(rawSiteData);
	const flashProducts = buildFlashSaleProducts(siteData);

	const headerRoot = document.getElementById('header-root');
	const categoryNavRoot = document.getElementById('category-nav-root');
	const featuredRoot = document.getElementById('featured-section-root');
	const flashSaleRoot = document.getElementById('flash-sale-root');
	const productSectionsRoot = document.getElementById('product-sections-root');
	const promoBannersRoot = document.getElementById('promo-banners-root');
	const trustSectionRoot = document.getElementById('trust-section-root');
	const testimonialSectionRoot = document.getElementById('testimonial-section-root');
	const footerRoot = document.getElementById('footer-root');

	headerRoot.innerHTML = renderHeader(siteData.header);
	if (categoryNavRoot) {
		categoryNavRoot.innerHTML = renderCategoryNav(siteData.categoryNav);
	}
	featuredRoot.innerHTML = renderFeaturedSection(siteData.featuredSection);
	flashSaleRoot.innerHTML = renderFlashSale(flashProducts);
	productSectionsRoot.innerHTML = siteData.productSections.map(renderProductSection).join('');
	promoBannersRoot.innerHTML = renderPromoBanners();
	trustSectionRoot.innerHTML = renderTrustSection();
	testimonialSectionRoot.innerHTML = renderTestimonials();
	footerRoot.innerHTML = renderFooter(siteData.footer);

	if (window.lucide) {
		window.lucide.createIcons();
	}

	initHeroSlider();
	initFlashTimer();
	setupMobileMenu();
	setupHeaderOnScroll();
	setupSearchOverlay(siteData);
	setupProductCardActions();
	setupProductVariantInteractions();
	setupProductGalleryInteractions();
	setupProductReviewFilterInteractions();
	setupRevealAnimations();
	setupTestimonialCarousel();

	// Initialize cart and dropdowns
	initSampleCart(siteData);
	setupDropdowns();
	setupCategoryNavigation(siteData);
}

init();
