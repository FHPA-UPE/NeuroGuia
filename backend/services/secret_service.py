import json
import os
import stat

_SECRETS_FILE = os.path.join(os.path.dirname(__file__), '..', 'secrets.json')


def get_key(name: str) -> str:
    """Read a secret by name. Falls back to empty string if not found."""
    try:
        with open(_SECRETS_FILE, encoding='utf-8') as f:
            data = json.load(f)
        return data.get(name, '')
    except (FileNotFoundError, json.JSONDecodeError):
        return ''


def set_keys(updates: dict[str, str]) -> None:
    """Merge non-empty key updates into secrets.json, creating it if needed."""
    try:
        with open(_SECRETS_FILE, encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}

    for name, value in updates.items():
        if value:
            data[name] = value

    with open(_SECRETS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    # chmod 600 (owner read/write only) — no-op on Windows but harmless
    try:
        os.chmod(_SECRETS_FILE, stat.S_IRUSR | stat.S_IWUSR)
    except OSError:
        pass
