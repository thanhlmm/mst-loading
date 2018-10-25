# MST-Loading

This is Mobx-State-Tree middleware for auto triggering `loading` flag for you async function. You can save lots of time trying to manage `loading` flag!

⏰ = 🤑

## Get started

### Install

```
npm install mst-loading
```

### Setup

#### Add loading store to under your root node

Example

```js
import { types } from 'mobx-state-tree';
import DataState from './DataState';
import { LoadingStore } from 'mst-loading';

const AppStore = types
  .model('AppStore', {
    currentUser: types.optional(types.string, 'Guest'),
    dataState: types.optional(DataState, {}),
    loading: LoadingStore // <--- Addd this store to your under root node
  })
  .actions(self => {
    const changeUser = name => {
      self.currentUser = name;
    };

    return {
      changeUser
    };
  });

export default AppStore;
```

#### Add as middleware

Add `mst-loading` as middleware

```
const appStore = stores.create({});
addMiddleware(appStore, LoadingMiddleWare('loading', true));
```

[Read more](https://github.com/mobxjs/mobx-state-tree/blob/master/packages/mst-middlewares/README.md) How to using middleware in MobX State Tree

### Usage

#### Async function

Write your async function like normal. **Remember using `flow` and generator function name** (the function name after `*`)

```js
const apiStore = types
  .model('apiStore', {
    result: types.frozen()
  })
  .actions(self => {
    const fetchApi = flow(function* fetchApi() {
      const response = yield transports.get('http://ip-api.com/json');
      yield delay(5000);
      console.log(response.data);
      self.result = response.data;
    });

    return {
      fetchApi
    };
  });
```

Then get `loading` flag by this path convention `{pathToYourNode}/{yourAsyncFunctionName}`

Example

```js
@inject('appStore')
@observer
class HomePage extends Component {
  componentDidMount() {
    const {
      appStore: { dataState }
    } = this.props;
    dataState.apiStore.fetchApi();
  }

  render() {
    const { appStore } = this.props;
    const { loading } = appStore;

    if (loading.status('/dataState/apiStore.fetchApi').isLoading) {
      return <Spin />;
    }

    return (
      <div className={styles['home-page']}>
        Hello {appStore.currentUser},<p>Have a good day</p>
      </div>
    );
  }
}
```

## API

### LoadingMiddleware

Create loadingStore for manage `loading` flag

#### Parameters

- `storeName` (string = loading) your `loading` store name under root node
- `debug` (bool = false) turn in on so can you track debug easily

### Example

```
const appStore = stores.create({});
addMiddleware(appStore, LoadingMiddleWare('loading', true));
```

### Loading type

Every instance of a flag has type

- `id` (string) your effect name
- `isLoading` (bool) loading flag
- `error` error returned by your async function

### LoadingStore

Just ignore it

# Contribution

Any contribution are welcome. Thanks for using my code!

Make with ❤️
