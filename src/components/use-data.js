export function useData({ list }) {
  const findRowById = (id) => {
    return list.value.find((it) => it.id == id)
  }

  return {
    findRowById
  }
}
