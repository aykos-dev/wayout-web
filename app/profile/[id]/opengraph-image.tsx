import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Outway traveler';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BADGE_EMOJI: Record<string, string> = {
  first_steps: '👣',
  weekend_warrior: '🥾',
  weekend_warrior_ii: '🥾',
  peak_bagger: '⛰️',
  peak_bagger_ii: '⛰️',
  peak_bagger_iii: '🏔️',
  photo_pro: '📸',
  storyteller: '✍️',
  social_butterfly: '🦋',
  local_legend: '🏆',
  early_adopter: '🌱',
};

interface Profile {
  fullName: string | null;
  xp: number;
  level: number;
  name: string;
  badges: { id: string }[];
}

// Dynamic social card for a traveler profile: name, level, XP, badge emojis.
export default async function Image({ params }: { params: { id: string } }) {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1';
  let profile: Profile | null = null;
  try {
    const res = await fetch(`${base}/users/${params.id}/profile`, {
      cache: 'no-store',
    });
    if (res.ok) profile = (await res.json()) as Profile;
  } catch {
    /* branded default below */
  }

  const fullName = profile?.fullName ?? 'Outway Explorer';
  const levelName = profile?.name ?? 'Pathfinder';
  const xp = profile?.xp ?? 0;
  const badges = (profile?.badges ?? []).slice(0, 8);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          background: 'linear-gradient(135deg, #0B7D4F 0%, #20B26B 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, color: '#ffffff', opacity: 0.85 }}>
          🏅 Top Traveler on Outway
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.05,
            marginTop: 12,
          }}
        >
          {fullName}
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 24, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 34,
              fontWeight: 700,
              color: '#0B7D4F',
              background: '#ffffff',
              borderRadius: 999,
              padding: '10px 28px',
            }}
          >
            Lv {profile?.level ?? 1} · {levelName}
          </div>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#ffffff' }}>
            {xp.toLocaleString('en-US')} XP
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 40, fontSize: 56 }}>
          {badges.map((b, i) => (
            <span key={i} style={{ display: 'flex' }}>
              {BADGE_EMOJI[b.id] ?? '🏅'}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
