import { effect as T, exit as E, managed as M } from "@matechs/effect";
import * as H from "@matechs/http-client";
import * as J from "@matechs/test-jest";
import express from "express";
import { Do } from "fp-ts-contrib/lib/Do";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { expressM } from "../resources/expressM";

/* istanbul ignore file */

export const headersSpec = J.testM(
  "headers",
  M.use(expressM(4012), ({ app }) =>
    Do(T.effect)
      .do(
        T.sync(() => {
          app.get("/h", express.json(), (req, res) => {
            res.send({
              foo: req.header("foo"),
            });
          });
        })
      )
      .bindL("get", () =>
        T.result(
          pipe(
            H.get("http://127.0.0.1:4012/h"),
            H.withHeaders({
              foo: "bar",
            })
          )
        )
      )
      .return(({ get }) => {
        J.assert.deepEqual(E.isDone(get), true);
        J.assert.deepEqual(
          E.isDone(get) && get.value.body,
          O.some({ foo: "bar" })
        );
      })
  )
);
