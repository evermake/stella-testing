language core;

extend with
  #records,
  #structural-subtyping;

fn f(r : {x : Nat}) -> Nat {
  return r.x
}

fn g(k : fn({y : Nat, x : Nat}) -> Nat) -> Nat {
  return k({x = 0, y = 0})
}

fn h(k : fn(fn({z : Nat}) -> Nat) -> Nat) -> Nat {
  return k( fn(r : {z : Nat}) { return r.z } )
}

fn main(n : Nat) -> Nat {
  return h(g)
}
