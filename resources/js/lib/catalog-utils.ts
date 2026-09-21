export function getSectionSlice<T>(
    items: T[],
    cols = 4,
    rowsLimit = 2
): { visible: T[]; showMore: boolean } {
    const maxVisible = cols * rowsLimit;
    if (items.length <= maxVisible) {
        return { visible: items, showMore: false };
    }
    return { visible: items.slice(0, maxVisible), showMore: true };
}
