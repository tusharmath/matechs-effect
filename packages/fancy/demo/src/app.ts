import * as O from "fp-ts/lib/Option";
import * as R from "../../lib";
import * as DT from "./date";
import { AppState } from "./state";
import { AppActions } from "./actions";
import * as ORGS from "./orgs";
import { pipe } from "fp-ts/lib/pipeable";
import { effect as T } from "@matechs/effect";

// alpha
/* istanbul ignore file */

const initialState = (): AppState =>
  AppState.build({
    date: new Date(),
    orgs: O.none,
    error: O.none
  });

export const App = R.app<DT.DateOps & ORGS.OrgsOps>()(
  initialState,
  AppState.type,
  AppActions.type,
  R.matcher(AppActions)({
    UpdateDate: () => DT.updateDate,
    UpdateOrganisations: (_, dispatch) =>
      pipe(
        ORGS.updateOrgs,
        T.chainTap(_ => dispatch(AppActions.of.UpdateDate({})))
      )
  })
);