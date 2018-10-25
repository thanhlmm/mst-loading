import { types, getSnapshot } from 'mobx-state-tree';

const Status = types.model({
  id: types.identifier,
  isLoading: types.optional(types.boolean, true),
  error: types.frozen(),
});

const LoadingStore = types.optional(
  types
    .model('LoadingStore', {
      data: types.map(Status),
    })
    .volatile(() => ({}))
    .views(self => ({
      status(service) {
        if (self.data.has(service)) {
          return getSnapshot(self.data.get(service));
        }

        // Default state
        return {
          id: null,
          isLoading: false,
          error: null,
        };
      },
    }))
    .actions((self) => {
      const updateStatus = (service, status, error) => {
        if (self.data.has(service)) {
          const effect = self.data.get(service);
          if (effect) {
            effect.isLoading = status;
            effect.error = error;
          }
        } else {
          self.data.put(Status.create({
            id: service,
            isLoading: status,
            error,
          }));
        }
      };

      return {
        updateStatus,
      };
    }),
  {},
);
/**
 * LoadingMiddleWare
 *
 * @param {string} [storeName='loading'] your `loading` store name under root node
 * @param {boolean} [debug=false] (bool) turn in on so can you track debug easily
 */
const LoadingMiddleware = (storeName = 'loading', debug = false) => (call, next) => {
  const {
    type, name, tree, context, args,
  } = call;
  if (!tree[storeName]) {
    throw new Error(`Can not find store "${storeName}". Make sure you put "LoadingStore under root node"`);
  }

  const loadingStore = tree[storeName];

  const effectName = `${context.$treenode.path}.${name}`;

  if (type === 'flow_spawn') {
    // Show loading indicator
    loadingStore.updateStatus(effectName, true);
    if (debug) {
      console.log(`"${effectName}" start loading`);
    }
  } else if (type === 'flow_return') {
    // Hide loading
    loadingStore.updateStatus(effectName, false);
    if (debug) {
      console.log(`"${effectName}" end loading`);
    }
  } else if (type === 'flow_throw') {
    // Show error
    loadingStore.updateStatus(effectName, false, args);
    if (debug) {
      console.log(`"${effectName}" got error`);
    }
  }

  next(call);
};

export { LoadingStore, Status, LoadingMiddleware };
