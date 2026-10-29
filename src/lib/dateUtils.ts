/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatHeaderDate(date: Date = new Date()): string {
  try {
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date.toDateString();
  }
}

export function formatCardDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatArticleFullDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('ca-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
