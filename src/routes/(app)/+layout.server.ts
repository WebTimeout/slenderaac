import { loadFlashMessage } from 'sveltekit-flash-message/server';

import { AccountType } from '$lib/accounts';
import { PlayerGroup } from '$lib/players';
import { dbToPlayer, PlayerSelectForList } from '$lib/server/players';
import { prisma } from '$lib/server/prisma';
import { parseTimeString } from '$lib/server/utils';

import { SERVER_SAVE_TIME } from '$env/static/private';

import type { LayoutServerLoad } from './$types';

export const load = loadFlashMessage(async ({ locals }) => {
	const highscores = await prisma.players.findMany({
		where: { group_id: { lt: PlayerGroup.Gamemaster }, deletion: 0 },
		select: PlayerSelectForList,
		orderBy: { experience: 'desc' },
		take: 5,
	});

	const boostedBoss = await prisma.boostedBoss.findFirst();
	const boostedCreature = await prisma.boostedCreature.findFirst();
	const staticPages = await prisma.staticPage.findMany({
		where: { hide: false },
		orderBy: { order: 'asc' },
	});

	const accountCharacters = locals.session?.accountId
		? await prisma.players.findMany({
				where: { account_id: locals.session.accountId },
				select: PlayerSelectForList,
		  })
		: null;

	const nextServerSave = parseTimeString(SERVER_SAVE_TIME || '00:00:00');

	return {
		highscores: highscores.map(dbToPlayer),
		boostedBoss,
		boostedCreature,
		isLoggedIn: Boolean(locals.session),
		isAdmin: locals.session?.type === AccountType.God,
		staticPages,
		accountCharacters: accountCharacters?.map(dbToPlayer),
		nextServerSave,
	};
}) satisfies LayoutServerLoad;
