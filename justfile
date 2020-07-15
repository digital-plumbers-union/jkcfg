build:
  bazel build //...

clean:
  rm -rf node_modules
  bazel clean --expunge

release version tag="next":
  #!/bin/bash
  git tag {{version}}
  hack/release.sh publish {{tag}}
  git push origin {{tag}}

