import { ImageResponse } from 'next/og';
import { api } from '@/lib/api';
import { absoluteMedia } from '@/lib/seo';

export const runtime = 'edge';
export const alt = 'Outway tour';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Dynamically rendered social card per tour: hero photo, title, region, price.
export default async function Image({ params }: { params: { slug: string } }) {
  let tour = null;
  try {
    tour = await api.getTourBySlug(params.slug);
  } catch {
    /* fall through to a branded default */
  }

  const title = tour?.title ?? tour?.place?.name ?? 'Outway';
  const region = tour?.place?.region ?? 'Uzbekistan';
  const price =
    tour && tour.finalPriceAmount
      ? `${Number(tour.finalPriceAmount).toLocaleString('en-US')} ${tour.priceCurrency}`
      : '';
  const hero = absoluteMedia(tour?.place?.mediaUrls?.[0]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          backgroundColor: '#0f1720',
          fontFamily: 'sans-serif',
        }}
      >
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.85) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '64px',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 30, color: '#ffffff', opacity: 0.9 }}>
            📍 {region}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px',
            }}
          >
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#ff385c' }}>
              {price}
            </div>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#ffffff' }}>
              Outway
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
