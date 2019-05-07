# gxc-demux

## DB

### gxc.transfers

|Column|Type|Default|Nullable|
|------|----|-------|--------|
|act_id|VARCHAR(66)||NO|
|sender|VARCHAR(12)||NO|
|receiver|VARCHAR(12)||NO|
|amount|NUMERIC(23)||NO|
|token|VARCHAR(7)||NO|
|game_account_name|VARCHAR(13)||NO|
|block_time|TIMESTAMP||NO|

**act_id:** trx_id + action index

### gxc.balances

|Column|Type|Default|Nullable|
|------|----|-------|--------|
|game_account_name|VARCHAR(13)||NO|
|owner|VARCHAR(12)||NO|
|token|VARCHAR(7)||NO|
|amount|NUMERIC(23)||NO|

### gxc.mints

|Column|Type|Defualt|Nullable|
|------|----|-------|--------|
|trx_id|VARCHAR(64)||NO|
|amount|NUMERIC(23)||NO|
|token|VARCHAR(7)||NO|
|gmae_account_name|VARCHAR(13)||NO|
|block_time|TIMESTAMP||NO|

### gxc.token_state

|Column|Type|Default|Nullable|
|------|----|-------|--------|
|game_account_name|VARCHAR(13)||NO|
|token|VARCHAR(7)||NO|
|token_precision|SMALLINT||NO|

## Build

```cmd
$ yarn install
$ yarn build // tsc && cp -R src/migrations dist
$ cd dist
$ node index.js
```
