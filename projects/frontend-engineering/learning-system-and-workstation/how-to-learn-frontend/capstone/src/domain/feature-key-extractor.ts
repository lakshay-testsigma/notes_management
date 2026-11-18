// A feature key is a dotted path such as css.properties.gap or api.Navigator.share.
const KEY_IN_BACKTICKS = /`((?:css|api|html|javascript|http|svg|mathml|webdriver)(?:\.[A-Za-z0-9_$-]+)+)`/g;

// Derive, do not copy: keys come from the note text, so editing the text updates the badges.
export class FeatureKeyExtractor {
  extract(text: string): string[] {
    const keys = new Set<string>();
    for (const match of text.matchAll(KEY_IN_BACKTICKS)) keys.add(match[1]);
    return [...keys];
  }
}
