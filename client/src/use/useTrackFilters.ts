import {
  ref, computed, Ref, watch,
} from '@vue/composition-api';
import Track, { TrackId } from '@/lib/track';
import { updateSubset } from '@/lib/utils';

/* Provide track filtering controls on tracks loaded from useTrackStore. */
export default function useFilteredTracks(
  { sortedTracks }: { sortedTracks: Readonly<Ref<readonly Track[]>> },
) {
  /* Track IDs explicitly checked "ON" by the user */
  const checkedTrackIds = ref(sortedTracks.value.map((t) => t.trackId));
  /* The confidence threshold to test confidecePairs against */
  const confidenceThreshold = ref(0.5);

  /* Collect all known types from confidence pairs */
  const allTypes = computed(() => {
    const typeSet = new Set<string>();
    sortedTracks.value.forEach((track) => {
      track.confidencePairs.forEach(([name]) => {
        typeSet.add(name);
      });
    });
    return Array.from(typeSet);
  });

  /* Categorical types checked "ON" by the user */
  const checkedTypes = ref(Array.from(allTypes.value));

  /* track IDs filtered by type and confidence threshold */
  const filteredTracks = computed(() => {
    const checkedSet = new Set(checkedTypes.value);
    const confidenceThresh = confidenceThreshold.value;
    return sortedTracks.value.filter((track) => {
      const confidencePairsAboveThreshold = track.confidencePairs
        .some(([confkey, confval]) => (
          confval >= confidenceThresh && checkedSet.has(confkey)
        ));
      return (
        /* include tracks where at least 1 confidence pair is above
         * the threshold and part of the checked type set */
        confidencePairsAboveThreshold
        /* include tracks with no confidence pairs */
        || track.confidencePairs.length === 0
      );
    });
  });

  const enabledTracks = computed(() => {
    const checkedSet = new Set(checkedTrackIds.value);
    return filteredTracks.value.filter((track) => checkedSet.has(track.trackId));
  });

  // because vue watchers don't behave properly, and it's better to not have
  // checkedTrackIds be a union null | array type
  let oldCheckedTrackIds: TrackId[] = [];
  /* When the list of types (or checked IDs) changes
   * add the new enabled types to the set and remove old ones */
  watch(sortedTracks, (newval) => {
    const IDs = newval.map((t) => t.trackId);
    const newArr = updateSubset(oldCheckedTrackIds, IDs, checkedTrackIds.value);
    if (newArr !== null) {
      oldCheckedTrackIds = IDs;
      checkedTrackIds.value = newArr;
    }
  });

  let oldCheckedtypes: string[] = [];
  watch(allTypes, (newval) => {
    const newArr = updateSubset(oldCheckedtypes, newval, checkedTypes.value);
    if (newArr !== null) {
      oldCheckedtypes = Array.from(newval);
      checkedTypes.value = newArr;
    }
  });

  function updateTypeName({ currentType, newType }: {currentType: string; newType: string}) {
    //Go through the entire list and replace the oldType with the new Type
    sortedTracks.value.forEach((track) => {
      track.confidencePairs.forEach(([name]) => {
        if (name === currentType) {
          track.setType(newType);
        }
      });
    });
  }

  return {
    checkedTrackIds,
    checkedTypes,
    confidenceThreshold,
    allTypes,
    filteredTracks,
    enabledTracks,
    updateTypeName,
  };
}