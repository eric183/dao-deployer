import create from 'zustand';
// import Dao_FrontType from '~/types/crdt';

export const ignoreReplayerStore = create<{
  ignoreReplayers: Dao_FrontType.ModuleType[];
  setIgnoreReplayer: (arg: Dao_FrontType.ModuleType[]) => void;
}>((set) => ({
  ignoreReplayers: [],
  setIgnoreReplayer: (arg: Dao_FrontType.ModuleType[]) =>
    set(() => ({ ignoreReplayers: arg })),
}));
