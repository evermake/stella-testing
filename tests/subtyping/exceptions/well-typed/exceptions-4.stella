language core;
extend with
  #structural-subtyping,
  #exceptions,
  #exception-type-declaration,
  #variants;

exception type = <| a : Nat, b : Bool, c : <| d : Nat |> |>

fn main(a : <| c : <| |>, a : Nat |>) -> Nat {
  return throw(a)
}
