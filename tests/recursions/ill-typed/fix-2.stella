language core;

extend with #fixpoint-combinator;

fn main(n : Bool) -> Bool {
  return fix(
    fn( f : fn(Bool) -> Bool) {
      return fn (a : Bool) {
        return if a then 0 else succ(0)
      }
    }
  )(n)
}
