// *****************************************************************************
// Copyright (C) 2017 Ericsson and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************
import * as chai from 'chai';
import { createTerminalTestContainer } from './test/terminal-test-container';
import { IShellTerminalServer } from '../common/shell-terminal-protocol';

/**
 * Globals
 */

const expect = chai.expect;

describe('ShellServer', function (this: Mocha.Suite): void {

    this.timeout(5000);
    let shellTerminalServer: IShellTerminalServer;

    beforeEach(function (this: Mocha.Context): void {
        shellTerminalServer = createTerminalTestContainer().get(IShellTerminalServer);
    });

    it('test shell terminal create', async function (): Promise<void> {
        const createResult = shellTerminalServer.create({});

        expect(await createResult).to.be.greaterThan(-1);
    });
});
