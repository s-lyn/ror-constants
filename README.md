# ror-constants

Constants of the rosreestr.ru: cadastral regions and districts.

Used on pages: `http://rosreestr.ru/api/online/fir_objects/*` and
`https://rosreestr.ru/wps/portal/p/cc_ib_portal_services/online_request/`

## Quick start

Install with NPM:

```sh
$ npm i ror-constants
``` 

Import to your script:

```js
const data = require('ror-constants')
```

| Param | Type | Description |
|-------|------|-------------|
| data[] | Array | Collection of subjects |
| data[].id | String | Rosreestr subject id, ex. "101000000000" |
| data[].type | String | Constant "subject" |
| data[].value | String | Rosreestr subject name, ex. "Алтайский край" |
| data[].children[] | String | Collection of regions |
| data[].children[].id | String | Rosreestr region id, ex. "101405000000" |
| data[].children[].type | String | Constant "region" |
| data[].children[].value | String | Rosreestr region name, ex. "Бийск" |
| data[].children[].children[] | String | Collection of settlements |
| data[].children[].children[].id | String | Roreestr settlement id, ex. "101405564000" |
| data[].children[].children[].type | String | Constant "settlement" |
| data[].children[].children[].value | String | Roreestr settlement name, ex. "Сорокино" |
| data[].children[].children[].settlementId | String | Roreestr settlement type id, ex. "set4" |
| data[].children[].children[].settlementType | String | Roreestr settlement type name, ex. "Город" |


## Parsing

```sh
DEBUG=ror-constants npm run parse
```