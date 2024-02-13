language core;

extend with #let-bindings, #let-patterns, #structural-patterns, #records;

fn main(n : Nat) -> Nat {
  return
  	let {a = x, b = false, c = z} =
      { a = 0
      , b = true
      , c = fn(x : Bool){ return if x then false else true}
      } in
    if z(y) then x else succ(x)
}
