export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}

export function share(text: string): void {
  if (navigator.share) {
    navigator.share({
      title: "Share",
      text,
    });
  }
}
