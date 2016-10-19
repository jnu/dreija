#!/bin/bash

. ./util/semver/semver.sh



LASTTAG=$(git tag | tail -1)
LASTVERSION=$(echo $LASTTAG | sed 's/v//')
NEWVERSION=$(echo $1 | sed 's/v//')
NEWTAG="v$NEWVERSION"
semverGT "$NEWVERSION" "$LASTVERSION"
ISGTVERSION=$?

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


SHA=$(git rev-parse --short HEAD)

echo "Building container $NEWTAG from $SHA"
eval "$(docker-machine env default)"
docker build -t "joen/dreija:$NEWTAG" -t "joen/dreija:latest" .

if [ "$?" != "0" ]; then
    echo >&2
    echo >&2 "Failed to build docker container. Aborting release."
    echo >&2
    exit 4
fi

echo "Tagging project version $NEWTAG at $SHA"
git tag -a "$NEWTAG" -m "Release bot tag $LASTTAG -> $NEWTAG"

echo "Pushing $NEWTAG to origin"
git push origin master --tags
