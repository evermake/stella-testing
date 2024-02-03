language core;

extend with
  #records,
  #structural-subtyping;

fn f(r : {x : Nat, z : Nat}) -> Nat {
  return r.x
}

fn g(k : fn({x : Nat}) -> Nat) -> Nat {
  return k({x = 0, y = 0})
}

fn main(n : Nat) -> Nat {
  return g(f);
}
