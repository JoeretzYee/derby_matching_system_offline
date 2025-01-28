export const initialState = {
  events: [],
  entries: [],
  specificEntries: [],
  toprankEntries: [],
  excludedEntrie: [],
  eventDetail: {},
};

export const actionTypes = {
  ADD_TO_EVENTS: "ADD_TO_EVENTS",
  ADD_TO_ENTRIES: "ADD_TO_ENTRIES",
  ADD_TO_SPECIFIC_ENTRIES: "ADD_TO_SPECIFIC_ENTRIES",
  ADD_TO_TOPRANK_ENTRIES: "ADD_TO_TOPRANK_ENTRIES",
  SET_EVENT_DETAIL: "SET_EVENT_DETAIL",
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TO_EVENTS:
      if (!Array.isArray(action.payload) || action.payload.length === 0) {
        return state;
      }
      // Combine arrays and remove duplicates based on `id`
      const combinedEvents = [...state.events, ...action.payload];
      const uniqueEvents = combinedEvents.filter(
        (event, index, self) =>
          index === self.findIndex((e) => e.id === event.id)
      );

      return {
        ...state,
        events: uniqueEvents,
      };
    case actionTypes.ADD_TO_ENTRIES:
      if (!Array.isArray(action.payload) || action.payload.length === 0) {
        return state;
      }
      // Combine arrays and remove duplicates based on `id`
      const combinedEntries = [...state.entries, ...action.payload];
      const uniqueEntries = combinedEntries.filter(
        (event, index, self) =>
          index === self.findIndex((e) => e.id === event.id)
      );

      return {
        ...state,
        entries: uniqueEntries,
      };
    case actionTypes.ADD_TO_SPECIFIC_ENTRIES:
      if (!Array.isArray(action.payload) || action.payload.length === 0) {
        return state;
      }
      // Combine arrays and remove duplicates based on `id`
      const combinedSpecificEntries = [
        ...state.specificEntries,
        ...action.payload,
      ];
      const uniqueSpecificEntries = combinedSpecificEntries.filter(
        (entry, index, self) =>
          index === self.findIndex((e) => e.id === entry.id)
      );

      return {
        ...state,
        specificEntries: uniqueSpecificEntries,
      };

    case actionTypes.ADD_TO_TOPRANK_ENTRIES:
      if (!Array.isArray(action.payload) || action.payload.length === 0) {
        return state;
      }
      // Combine arrays and remove duplicates based on `id`
      const combinedToprankEntries = [
        ...state.toprankEntries,
        ...action.payload,
      ];
      const uniqueToprankEntries = combinedToprankEntries.filter(
        (event, index, self) =>
          index === self.findIndex((e) => e.id === event.id)
      );

      return {
        ...state,
        toprankEntries: uniqueToprankEntries,
      };
    case actionTypes.SET_EVENT_DETAIL:
      return {
        ...state,
        eventDetail: action.payload,
      };
    default:
      return state; // Ensure the reducer returns the current state for unknown actions
  }
};
export default reducer;
