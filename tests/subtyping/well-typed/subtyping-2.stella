language core;

extend with
  #records,
  #structural-subtyping;

fn f(r : {x : Nat}) -> Nat {
  return r.x
}

fn main(n : Nat) -> Nat {
  return f({x = n, y = n});
}
