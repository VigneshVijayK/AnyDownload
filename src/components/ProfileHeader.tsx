import type { ProfileInfo } from "@/lib/types";

type Props = {
  profile: ProfileInfo;
  accentColor?: string;
};

function RelatedProfileCard({ p: { username, fullName, avatar, isVerified, isPrivate } }: { p: ProfileInfo["relatedProfiles"][number] }) {
  const proxied = `/api/proxy?mode=inline&url=${encodeURIComponent(avatar)}`;
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl transition-all" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ background: "var(--bg-inset)" }}>
        <img src={proxied} alt={username} className="w-full h-full object-cover" loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-text-primary truncate">{fullName || username}</span>
          {isVerified && (
            <svg className="w-3 h-3 shrink-0 text-[#0095f6]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          )}
          {isPrivate && (
            <svg className="w-3 h-3 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
        <p className="text-xs text-text-muted truncate">@{username}</p>
      </div>
    </div>
  );
}

export default function ProfileHeader({ profile, accentColor = "#e1306c" }: Props) {
  const proxiedAvatar = `/api/proxy?mode=inline&url=${encodeURIComponent(profile.avatar)}`;
  const downloadAvatar = `/api/proxy?mode=download&url=${encodeURIComponent(profile.avatar)}`;

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 glass rounded-2xl">
        <div className="relative shrink-0 group">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-offset-2 transition-all duration-500"
            style={{
              "--tw-ring-color": accentColor,
              "--tw-ring-offset-color": "var(--bg-primary)",
            } as React.CSSProperties}
          >
            <img
              src={proxiedAvatar}
              alt={profile.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = profile.avatar;
              }}
            />
          </div>
          <a
            href={downloadAvatar}
            download
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90"
            style={{ background: accentColor, boxShadow: `0 2px 12px ${accentColor}66` }}
            aria-label="Download profile picture"
            title="Download profile picture"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </a>
          {profile.isVerified && (
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0095f6] rounded-full flex items-center justify-center ring-2" style={{ "--tw-ring-color": "var(--bg-primary)" } as React.CSSProperties}>
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </span>
          )}
          {profile.isPrivate && (
            <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-[rgba(0,0,0,0.75)] backdrop-blur-[8px] rounded-full text-[10px] font-medium text-white ring-1 ring-[rgba(255,255,255,0.15)] flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Private
            </span>
          )}
        </div>
        <div className="text-center sm:text-left min-w-0 flex-1">
          <h3 className="text-xl font-bold text-text-primary truncate">
            {profile.fullName || profile.username}
          </h3>
          <p className="text-sm text-text-secondary">
            @{profile.username}
          </p>
          {profile.biography && (
            <p className="text-sm text-text-secondary mt-1.5 line-clamp-3 max-w-md whitespace-pre-wrap">
              {profile.biography}
            </p>
          )}
          <div className="flex items-center gap-5 mt-3 text-sm">
            <span className="text-text-muted">
              <strong className="text-text-primary">{profile.postsCount.toLocaleString()}</strong> posts
            </span>
            <span className="text-text-muted">
              <strong className="text-text-primary">{profile.followers.toLocaleString()}</strong> followers
            </span>
            <span className="text-text-muted">
              <strong className="text-text-primary">{profile.following.toLocaleString()}</strong> following
            </span>
          </div>
        </div>
      </div>

      {profile.relatedProfiles.length > 0 && (
        <div className="mt-5 p-5 glass rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: accentColor }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h4 className="text-sm font-semibold text-text-primary">Suggested Profiles</h4>
          </div>
          <p className="text-xs text-text-muted mb-3">
            Full follower/following lists require authentication. Here are some related profiles instead.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
            {profile.relatedProfiles.slice(0, 12).map((p) => (
              <RelatedProfileCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
