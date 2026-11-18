# Build de todas as imagens: docker buildx bake [--push]
# TAG e REGISTRY vêm do CI; localmente: TAG=dev docker buildx bake --load
variable "REGISTRY" { default = "ghcr.io/kleidimilson/zenbit-sandbox" }
variable "TAG"      { default = "dev" }
variable "VERSION"  { default = "dev" }
variable "REVISION" { default = "unknown" }

group "default" { targets = ["api", "web", "migrate"] }

target "_common" {
  context   = "."
  platforms = ["linux/amd64"]
  args      = { VERSION = VERSION, REVISION = REVISION }
  labels    = { "org.opencontainers.image.revision" = REVISION }
}

target "api" {
  inherits   = ["_common"]
  dockerfile = "docker/api.Dockerfile"
  tags       = ["${REGISTRY}-api:${TAG}"]
}

target "web" {
  inherits   = ["_common"]
  dockerfile = "docker/web.Dockerfile"
  tags       = ["${REGISTRY}-web:${TAG}"]
}

target "migrate" {
  inherits   = ["_common"]
  dockerfile = "docker/migrate.Dockerfile"
  tags       = ["${REGISTRY}-migrate:${TAG}"]
}
