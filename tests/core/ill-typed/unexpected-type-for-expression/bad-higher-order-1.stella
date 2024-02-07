language core;

fn iszero(n : Nat) -> Bool {
    return Nat::rec(n, true, fn(i : Nat) {
        return fn(r : Bool) {
            return true
        }
    })
}

fn f(g : fn(Bool) -> Nat) -> fn(Nat) -> Bool {
    return fn(n : Nat) {
        return g(if iszero(n) then false else true)
    }
}

fn main(n : Nat) -> Nat {
  return f(fn (x : Bool) { return if x then n else succ(n) })(0)
}