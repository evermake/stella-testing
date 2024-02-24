language core;
extend with #variants;

fn g(x : <| a : Nat, a : Bool, c : fn(Nat) -> Nat |>) -> Nat {
  return match x {
      <| a   = n |> => succ(n)
    | <| a   = b |> => if b then succ(0) else 0
    | <| c   = f |> => f(f(succ(0)))
  }
}

fn main(x : Nat) -> Nat {
  return g(<| c = fn(n : Nat) { return g(<| a = n |>) } |>)
}
