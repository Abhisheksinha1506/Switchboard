"""Aggregate explicitly supplied anonymous Arcade Lab JSON exports; standard library only."""
import json
import sys
from pathlib import Path
from statistics import mean

def load(paths):
    people = {}
    for path in paths:
        d = json.loads(Path(path).read_text())
        if d.get('schemaVersion') != 1 or not isinstance(d.get('participant'), str):
            raise ValueError(f'{path}: unsupported export')
        person = people.setdefault(d['participant'], {'rounds': {}, 'votes': [], 'order': d['order']})
        for r in d['rounds']:
            if r.get('game') not in ('pulse', 'bloom'):
                raise ValueError(f'{path}: unknown game')
            old = person['rounds'].get(r['id'])
            if old is None or (r.get('endedAt', r['startedAt']), r.get('activeSeconds', 0)) >= (old.get('endedAt', old['startedAt']), old.get('activeSeconds', 0)):
                person['rounds'][r['id']] = r
        person['votes'].extend(d['votes'])
    return list(people.values())

def report(people, title):
    print(f'\n{title}: {len(people)} browser participants')
    for game, name in [('pulse', 'Switchboard'), ('bloom', 'Room to Grow')]:
        exposed = [sorted((r for r in p['rounds'].values() if r['game'] == game), key=lambda r: r['startedAt']) for p in people]
        exposed = [rs for rs in exposed if rs]
        eligible = [rs for rs in exposed if any(r['status'] == 'completed' for r in rs)]
        replay = sum(any(r.get('voluntaryReplay', False) for r in rs) for rs in eligible)
        first_complete = sum(rs[0]['status'] == 'completed' for rs in exposed)
        later = sum(len({r['day'] for r in rs}) > 1 for rs in exposed)
        rate = f'{100 * replay / len(eligible):.1f}%' if eligible else 'n/a'
        seconds = f'{mean(rs[0]["activeSeconds"] for rs in exposed):.1f}' if exposed else 'n/a'
        print(f'  {name}: exposed={len(exposed)}; first completed={first_complete}/{len(exposed)}; voluntary replay={replay}/{len(eligible)} ({rate}); mean first-round seconds={seconds}; later-day players={later}')
    votes = [max(p['votes'], key=lambda v: v['at'])['game'] for p in people if p['votes']]
    print('  Latest stated preferences:', {k: votes.count(k) for k in ('pulse', 'bloom', 'neither')})

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('Usage: python3 analyze.py export1.json [export2.json ...]')
    try:
        people = load(sys.argv[1:])
    except (OSError, ValueError, KeyError, TypeError) as exc:
        sys.exit(f'Could not analyze exports: {exc}')
    report(people, 'All participants')
    both = [p for p in people if all(any(r['game'] == k and r['status'] == 'completed' for r in p['rounds'].values()) for k in ('pulse', 'bloom'))]
    report(both, 'Completed both (dropout-sensitive subset)')
    for first in ('pulse', 'bloom'):
        report([p for p in people if p['order'][0] == first], f'Assigned {first} first')
    print('\nExploratory evidence only. No statistical winner or revenue inference. Later-day play is not D1 retention.')
