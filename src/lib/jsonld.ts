import type { FaqItem } from '../content/faq';
import type { PackageGroup } from '../content/packages';
import { site } from '../content/site';

/**
 * Structured data (JSON-LD). Alles komt uit dezelfde bronnen als de pagina's,
 * zodat prijzen en bedrijfsgegevens nooit uit de pas lopen.
 */

export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    email: site.email,
    telephone: site.phoneHref.replace('tel:', ''),
    logo: `${site.url}/icon-512.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressCountry: 'NL',
    },
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'KvK',
      value: site.kvk,
    },
    areaServed: 'NL',
    description: site.description,
  };
}

/** Eén dienst (Websites, Applicaties of Beheer) met de vanaf-prijzen per pakket, excl. btw. */
export function serviceJsonLd(group: PackageGroup, path: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${group.title} op abonnementsbasis`,
    serviceType: group.title,
    url: `${site.url}${path}`,
    provider: { '@id': `${site.url}/#organization` },
    areaServed: 'NL',
    offers: group.items.map((pkg) => ({
      '@type': 'Offer',
      name: pkg.name,
      url: `${site.url}${path}`,
      priceCurrency: 'EUR',
      price: pkg.monthly,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: pkg.monthly,
        priceCurrency: 'EUR',
        valueAddedTaxIncluded: false,
        unitText: 'maand',
        billingDuration: group.minTermMonths,
        billingIncrement: 1,
      },
      description: pkg.features.join('. '),
    })),
  };
}

export function faqJsonLd(items: readonly FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
