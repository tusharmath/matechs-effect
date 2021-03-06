import * as wave from "waveguide/lib/wave";
import * as T from "../src/effect";
import { QIO, defaultRuntime } from "@qio/core";
import { Suite } from "benchmark";

const MAX = 1e4;

const waveMapper = (_: bigint) => wave.pure(_ + BigInt(1));
const effectMapper = (_: bigint) => T.pure(_ + BigInt(1));
const qioMapper = (_: bigint) => QIO.resolve(_ + BigInt(1));

export const nestedChainQio = (): QIO<bigint> => {
  let io: QIO<bigint> = QIO.resolve(BigInt(0));
  for (let i = 0; i < MAX; i++) {
    io = QIO.chain(io, qioMapper);
  }
  return io;
};

export const nestedChainWave = (): wave.Wave<never, bigint> => {
  let io: wave.Wave<never, bigint> = wave.pure(BigInt(0));
  for (let i = 0; i < MAX; i++) {
    io = wave.chain(io, waveMapper);
  }
  return io;
};

export const nestedChainEffect = (): T.Effect<T.NoEnv, never, bigint> => {
  let io: T.Effect<T.NoEnv, never, bigint> = T.pure(BigInt(0));
  for (let i = 0; i < MAX; i++) {
    io = T.effect.chain(io, effectMapper);
  }
  return io;
};

export const nestedChainEffectFluent = (): T.Effect<T.NoEnv, never, bigint> => {
  let io = T.fluent(T.pure(BigInt(0)));
  for (let i = 0; i < MAX; i++) {
    io = io.chain(effectMapper);
  }
  return io.done();
};

const benchmark = new Suite(`NestedChain ${MAX}`, { minTime: 10000 });

benchmark
  .add(
    "effect",
    (cb: any) => {
      T.run(nestedChainEffect(), () => {
        cb.resolve();
      });
    },
    { defer: true }
  )
  .add(
    "effect-fluent",
    (cb: any) => {
      T.run(nestedChainEffectFluent(), () => {
        cb.resolve();
      });
    },
    { defer: true }
  )
  .add(
    "wave",
    (cb: any) => {
      wave.run(nestedChainWave(), () => {
        cb.resolve();
      });
    },
    { defer: true }
  )
  .add(
    "qio",
    (cb: any) => {
      defaultRuntime().unsafeExecute(nestedChainQio(), () => {
        cb.resolve();
      });
    },
    { defer: true }
  )
  .on("cycle", function(event: any) {
    console.log(String(event.target));
  })
  .on("complete", function(this: any) {
    console.log(`Fastest is ${this.filter("fastest").map("name")}`);
  })
  .run({ async: true });
