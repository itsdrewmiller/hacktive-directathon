hacktive-directathon
====================

A node/angular web app for hackathon voting, with active directory support.  Or maybe only facebook support, who knows.


To run
------

1.	Install mongodb and node
2.	Create a facebook app and note the id and key
3.	create a config.json file - something like this:

		{
			"fbSettings": {
				"APP_ID": "Your ID here",
				"APP_SECRET": "Your secret here"
			},
			"sessionSecret": "You're sitting on a gold mine, Trebek!",
			"awards": [
				{
					"id": "best",
					"name": "Best in Show",
					"description": "The top award for the hackathon - this should go to your favorite project of all."
				},
				{	"id": "shipit",
					"name": "Ship It!",
					"description": "Just check it in, it's ready for production!"
				},
				{
					"id": "pretty",
					"name": "Prettiest",
					"description": "This award is for the best use of data visualization, or maybe just the most gorgeous looking hackathon project."
				},
				{
					"id": "rubegoldberg",
					"name": "Biggest Rube Goldberg",
					"description": "For the project that has everything, and needs everything to work just right in order to function."
				},
				{
					"id": "succeed",
					"name": "Most Likely to Succeed (at Making a Bunch of Money)",
					"description": "Is the project likely to make us mucho filthy lucre?  If so, it should win this award."
				},
				{
					"id": "icarus",
					"name": "The Icarus",
					"description": "This is for a product that is awesome, but would melt our servers if put into production without some serious optimization work.  Should have used Elasticsearch!"
				}
			],
			"projects": [
				{
					"id": "proj1",
					"name": "A program to determine whether another program will continue to run forever",
					"authors": ["Drew Miller"]
				},
				{
					"id": "proj2",
					"name": "Visual Studio Mobile",
					"authors": ["Jack Dolabany", "Katie Sullivan"]
				},
				{
					"id": "proj3",
					"name": "WUPHF",
					"authors": ["Ean Moody", "James Railey", "Andrew Varnerin"]
				}
			]
		}

4.	Run the program: `supervisor hd.js`