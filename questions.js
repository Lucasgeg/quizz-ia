// Les questions du quiz. Modifiez librement ce fichier puis redémarrez le serveur.
//
// Types disponibles :
//   poll   : sondage sans bonne réponse
//   choice : choix unique avec une bonne réponse (correct = index de l'option, à partir de 0)
//   text   : réponse libre courte, affichée en nuage de mots
//
// Champs optionnels : texts (encadrés affichés sur l'écran animateur), explanation (affichée à la révélation)

module.exports = [
  {
    type: 'poll',
    title: "À quelle fréquence utilisez-vous l'IA au travail ?",
    options: ['Jamais', "J'ai déjà testé", 'Chaque semaine', 'Chaque jour'],
  },
  {
    type: 'choice',
    title: 'Lequel de ces deux mails a été écrit par une IA ?',
    texts: [
      {
        label: 'Mail A',
        body:
          "Bonjour Madame Martin,\n\nJe vous remercie pour notre échange constructif de ce matin. Comme convenu, vous trouverez ci-joint la proposition révisée, qui intègre vos remarques sur le calendrier et le budget.\n\nJe vous propose de faire un point jeudi prochain.\n\nBien cordialement,",
      },
      {
        label: 'Mail B',
        body:
          "Salut Julien,\n\ndésolé pour le retard, grosse journée... J'ai regardé ton doc vite fait, globalement ok pour moi mais je tiquerais sur la partie budget. On en parle demain à la machine à café ?\n\nBonne soirée !",
      },
    ],
    options: ['Le mail A', 'Le mail B', 'Les deux', 'Aucun des deux'],
    correct: 2,
    explanation:
      "Les deux ! Pour le B, on a simplement demandé : « écris comme un collègue pressé ». L'IA imite le ton qu'on lui demande.",
  },
  {
    type: 'choice',
    title: 'Vrai ou faux : une IA peut inventer une source ou un chiffre, avec une totale assurance.',
    options: ['Vrai', 'Faux'],
    correct: 0,
    explanation:
      "Vrai. On parle d'« hallucination » : l'IA produit un texte plausible, pas une vérité vérifiée. D'où la règle : on relit, on vérifie.",
  },
  {
    type: 'choice',
    title: "Laquelle de ces informations pouvez-vous coller sans risque dans une IA grand public (compte personnel, gratuit ou payant) ?",
    options: [
      'Le fichier clients (noms, emails)',
      'Les résultats financiers pas encore publiés',
      'Un article de presse déjà publié',
      "Le contrat signé avec un partenaire",
    ],
    correct: 2,
    explanation:
      "Seul l'article public ne pose pas de problème. Pour le reste : l'outil validé par l'entreprise, et même avec une licence, on respecte la confidentialité des documents.",
  },
  {
    type: 'choice',
    title:
      "Étude Harvard / BCG (2023) : sur les tâches adaptées à l'IA, de combien les consultants équipés ont-ils été plus rapides ?",
    options: ['5 %', '25 %', '50 %', '80 %'],
    correct: 1,
    explanation:
      "Environ 25 %, avec un travail de bien meilleure qualité. Mais sur une tâche hors de portée de l'IA, ils se sont davantage trompés : tout l'enjeu est de savoir quand l'utiliser.",
  },
  {
    type: 'text',
    title: "Quelle tâche allez-vous confier à l'IA cette semaine ?",
    hint: 'Un ou deux mots',
  },
];
