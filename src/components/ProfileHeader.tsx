import type { ProfileInfo } from "@/lib/instagram";

type Props = {
  profile: ProfileInfo;
};

function RelatedProfileCard({ p: { username, fullName, avatar, isVerified, isPrivate } }: { p: ProfileInfo["relatedProfiles"][number] }) {
  const proxied = `/api/proxy?mode=inline&url=${encodeURIComponent(avatar)}`;
  return (
    <div className="flex items-center gap-3 p-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl transition-all hover:bg-[rgba(255,255,255,0.06)]">
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#0a0a0f]">
        <img src={proxied} alt={username} className="w-full h-full object-cover" loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-white truncate">{fullName || username}</span>
          {isVerified && (
            <svg className="w-3 h-3 shrink-0 text-[#0095f6]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          )}
          {isPrivate && (
            <svg className="w-3 h-3 shrink-0 text-[rgba(255,255,255,0.35)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
        <p className="text-xs text-[rgba(255,255,255,0.45)] truncate">@{username}</p>
      </div>
    </div>
  );
}

export default function ProfileHeader({ profile }: Props) {
  const proxiedAvatar = `/api/proxy?mode=inline&url=${encodeURIComponent(profile.avatar)}`;

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 glass rounded-2xl">
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-[#e1306c] ring-offset-2 ring-offset-[#0a0a0f]">
            <img
              src={proxiedAvatar}
              alt={profile.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = profile.avatar;
              }}
            />
          </div>
          {profile.isVerified && (
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0095f6] rounded-full flex items-center justify-center ring-2 ring-[#0a0a0f]">
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
          <h3 className="text-xl font-bold text-white truncate">
            {profile.fullName || profile.username}
          </h3>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">
            @{profile.username}
          </p>
          {profile.biography && (
            <p className="text-sm text-[rgba(255,255,255,0.7)] mt-1.5 line-clamp-3 max-w-md whitespace-pre-wrap">
              {profile.biography}
            </p>
          )}
          <div className="flex items-center gap-5 mt-3 text-sm">
            <span className="text-[rgba(255,255,255,0.65)]">
              <strong className="text-white">{profile.postsCount.toLocaleString()}</strong> posts
            </span>
            <span className="text-[rgba(255,255,255,0.65)]">
              <strong className="text-white">{profile.followers.toLocaleString()}</strong> followers
            </span>
            <span className="text-[rgba(255,255,255,0.65)]">
              <strong className="text-white">{profile.following.toLocaleString()}</strong> following
            </span>
          </div>
        </div>
      </div>

      {profile.relatedProfiles.length > 0 && (
        <div className="mt-5 p-5 glass rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-[#e1306c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h4 className="text-sm font-semibold text-white">Suggested Profiles</h4>
          </div>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mb-3">
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
