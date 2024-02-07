language core;

extend with #pairs;

fn f2(x : { Nat, Nat }) -> { { Nat, Nat }, { Nat, Nat } } { return { x, x } }
fn f3(x : { { Nat, Nat }, { Nat, Nat } }) -> { { { Nat, Nat }, { Nat, Nat } }, { { Nat, Nat }, { Nat, Nat } } } { return { x, x } }
fn f1(x : Nat) -> { Nat, Nat } { return { x, {x,x} } }

fn main(x : Nat) -> Nat {
  return
    f3(f2(f1(0))).2.1.2
}
