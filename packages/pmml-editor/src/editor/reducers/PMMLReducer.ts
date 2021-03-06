/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ActionMap, Actions, AllActions } from "./Actions";
import { HistoryService } from "../history/HistoryProvider";
import { Model, PMML } from "@kogito-tooling/pmml-editor-marshaller";
import { Reducer } from "react";
import { HistoryAwareReducer } from "../history/HistoryAwareReducer";

interface PMMLPayload {
  [Actions.SetVersion]: {
    readonly version: string;
  };
  [Actions.DeleteModel]: {
    readonly model: Model;
  };
}

export type VersionActions = ActionMap<PMMLPayload>[keyof ActionMap<PMMLPayload>];

interface StateControlPayload {
  [Actions.Undo]: undefined;
  [Actions.Redo]: undefined;
}

export type StateControlActions = ActionMap<StateControlPayload>[keyof ActionMap<StateControlPayload>];

export const PMMLReducer: HistoryAwareReducer<PMML, AllActions> = (
  service: HistoryService
): Reducer<PMML, AllActions> => {
  return (state: PMML, action: AllActions) => {
    switch (action.type) {
      case Actions.SetVersion:
        return service.mutate(state, null, draft => {
          draft.version = action.payload.version;
        });

      case Actions.DeleteModel:
        return service.mutate(state, null, draft => {
          const model = action.payload.model;
          if (draft.models) {
            const models = draft.models;
            const index = models.indexOf(model);
            if (index >= 0 && index < models.length) {
              models.splice(index, 1);
            }
          }
        });

      case Actions.Undo:
        return service.undo(state);

      case Actions.Redo:
        return service.redo(state);
    }

    return state;
  };
};
