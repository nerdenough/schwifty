# Schwifty

![](https://i.goodenough.nz/schwifty.gif)

Schwifty is a Swift extension for VS Code that enables autocompletion and formatting through the
use of [SourceKitten][1] and [SwiftLint][2].

## Features

These are the current features that Schwifty currently offers:

- Code formatting
- Style linting via SwiftLint
- Error checking

Features currently in progress:

- Code completion

## Prerequisites

### Swift

Schwifty currently supports Swift 4.1. You can download the Swift toolchain for both macOS and
Ubuntu from the [Swift][4] website.

### SourceKitten

In order to use Schwifty, you need to have [SourceKitten][1] installed. SourceKitten provides
access to SourceKit and allows for code completion and formatting support.

The easiest way to install SourceKitten on macOS is via [Homebrew][3]:

```bash
brew install sourcekitten
```

For other ways to install SourceKitten on macOS and Linux, take a look at the [SourceKitten][1]
readme.

### SwiftLint

[SwiftLint][2] is used for linting Swift code in Schwifty.

The easiest way to install SwiftLint on macOS is via [Homebrew][3]:

```bash
brew install swiftlint
```

For other ways to install SwiftLint on macOS and Linux, take a look at the [SwiftLint][2]
readme.

[1]: https://github.com/jpsim/SourceKitten
[2]: https://github.com/realm/SwiftLint
[3]: https://brew.sh
[4]: https://swift.org/download/
