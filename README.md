# gxc-demux

## DB

### gxc.transfers

|Column|Type|Default|Nullable|
|------|----|-------|--------|
|trx_id|VARCHAR(64)||NO|
|sender|VARCHAR(12)||NO|
|receiver|VARCHAR(12)||NO|
|amount|NUMERIC(23)||NO|
|token|VARCHAR(7)||NO|
|game_account_name|VARCHAR(13)||NO|
|block_time|TIMESTAMP||NO|

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
