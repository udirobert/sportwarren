const TELEGRAM_PLATFORM = 'telegram';

type AvatarPlatformIdentity = {
  platform?: string | null;
  photoUrl?: string | null;
};

type AvatarSourceUser = {
  avatar?: string | null;
  platformIdentities?: AvatarPlatformIdentity[] | null;
};

function normalizeUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function resolveAvatarImageUrl(user: AvatarSourceUser | null | undefined): string | null {
  const explicitAvatar = normalizeUrl(user?.avatar);
  if (explicitAvatar) {
    return explicitAvatar;
  }

  const telegramAvatar = user?.platformIdentities?.find(
    (identity) => identity.platform === TELEGRAM_PLATFORM && normalizeUrl(identity.photoUrl),
  )?.photoUrl;

  return normalizeUrl(telegramAvatar);
}
