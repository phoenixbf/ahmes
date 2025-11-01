# Ahmes
"Ahmes" web-app

## Getting started
1) Follow [ATON framework instructions](https://github.com/phoenixbf/aton) for offline or online deployment

2) Just place (or git clone) app folder in `/Your-ATON-root-folder/wapps/` thus obtaining: `/Your-ATON-root-folder/wapps/ahmes/`

3) Open http://localhost:8080/a/ahmes/

## Parameters
- i: the item to load (ID from main db, e.g. "M009")

## Config
You need a `config.json` in your local `/Your-ATON-root-folder/wapps/ahmes/` indicating base collection root:
```
{
    "collection": "my/path/to/models/"
}
```