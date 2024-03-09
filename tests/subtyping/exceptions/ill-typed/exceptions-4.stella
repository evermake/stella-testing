language core;
extend with
  #structural-subtyping,
  #exceptions,
  #exception-type-declaration,
  #variants;

exception type = <| a : Nat, b : Bool, c : <| |> |>

fn main(a : <| c : <| d : Nat |>, a : Nat |>) -> Nat {
  return throw(a)
}
