#!/bin/bash

. ./util/semver/semver.sh

LASTTAG=$(git tag | tail -1)
LASTVERSION=$(echo $LASTTAG | sed 's/v//')
NEWVERSION=$(echo $1 | sed 's/v//')
NEWTAG="v$NEWVERSION"
semverGT "$NEWVERSION" "$LASTVERSION"
ISGTVERSION=$?
NODEVERSION=$(node -v | sed 's/v//')
semverGT "$NODEVERSION" "4.5.99"
ISNODEVERSIONOK=$?

if [ "$ISNODEVERSIONOK" != "0" ]; then
    echo >&2
    echo >&2 "Must release with node version >= 4.6.0"
    echo >&2
    exit 1
fi

if [ "$ISGTVERSION" != "0" ]; then
    echo >&2
    echo >&2 "New release semver must be greater than latest: $LASTTAG"
    echo >&2
    exit 1
fi

REPOSTATUS=$(git status -s --porcelain -u -z)

if [ -n "$REPOSTATUS" ]; then
    echo >&2
    echo >&2 "The branch is not clean. Please check in all changes before release."
    echo >&2
    echo >&2
    git status
    exit 2
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" != "master" ]; then
    echo >&2
    echo >&2 "Current branch is not master. Please release off master."
    echo >&2
    exit 3
fi

# Update package.json with the new version
cat package.json | node -e "process.stdin.resume(); process.stdin.on('data', d => { const p = JSON.parse(d); p.version='$NEWVERSION'; process.stdout.write(JSON.stringify(p, null, 2))});" > .tmppackagejson
cat .tmppackagejson > package.json
rm .tmppackagejson
git add package.json
git commit -m "Release version $NEWVERSION"

SHA=$(git rev-parse --short HEAD)

echo "Tagging project version $NEWTAG at $SHA"
git tag -a "$NEWTAG" -m "Release bot tag $LASTTAG -> $NEWTAG"

echo "Pushing $NEWTAG to origin"
git push origin master --tags

echo "Releasing to npm"
npm publish


