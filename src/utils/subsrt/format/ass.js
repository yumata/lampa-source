import ssa from './ssa'

//Compatible format
export default {
  name: "ass",
  helper: ssa.helper,
  detect: ssa.detect,
  parse: ssa.parse,
  build: ssa.build
}