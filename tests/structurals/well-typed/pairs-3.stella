language core;

extend with #sum-types, #structural-patterns, #pairs;

fn f(x : { Nat + Bool, Nat }) -> Nat {
  return match x {
     {inl(n), m} => if Nat::iszero(n) then m else n
    | {inr(b), m} => if b then succ(m) else m
  }
}

fn main(n : Nat) -> Nat {
  return f({ inl(n), 0})
}