
var enemies;
var walls;
var player;
var cursor;
var collisionTiles;
var coins;
var wallCollisionGroup;
var points=0;
var fireButton;
var playerDirection=0; // potrzebne przy kierunku przycisku
var nextFireTime;
var bullet;
var koniecGryString="";
var map;
var layer;
var objectlayer;
var enemylayer;

Coin=function(x,y){
    this.coin = game.add.sprite(x,y, 'coin', 0);
    game.physics.enable(this.coin, Phaser.Physics.ARCADE);
    this.coin.body.immovable=false;
    this.coin.animations.add('spin', [0, 1, 2, 3, 4, 5], 10, true);
    this.coin.animations.play('spin');
}

Enemy=function(x, y) {
    this.enemy=game.add.sprite(x, y, 'enemy', 0);
    game.physics.enable(this.enemy, Phaser.Physics.ARCADE);
    this.enemy.body.collideWorldBounds=true;
    this.enemy.body.gravity.y=300; //Grawitacja wrogow
    this.enemy.body.velocity.x=50;
    this.enemy.body.velocity.y=0;
    this.enemy.body.immovable=false;
    this.enemy.body.bounce.set(1);
}

function preload(){
    game.load.tilemap('level1', 'nowamapa.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset1', 'assets2/tileset.png');
    game.load.image('tileset2', 'assets2/coin.png');
    game.load.image('tileset3', 'assets/sprites/coin.png');
    //game.load.image('player', 'assets2/player.png');
    game.load.spritesheet('player', 'assets2/player2.png', 20, 20);
    game.load.image('bullet', 'assets/games/tanks/bullet.png');
    game.load.image('wallV', 'assets2/wallVertical.png');
    game.load.image('wallH', 'assets2/wallHorizontal.png');
    //game.load.image('kolizyjnyImg', 'assets2/enemyBlockTile.png');
    game.load.image('kolizyjnyImg', 'assets2/coin.png');
    game.load.spritesheet('coin', 'assets/sprites/coin.png', 32, 32);
    game.load.image('enemy', 'assets2/enemy.png');
}


// Ładowanie zasobów gry
function preloadOld() {
    game.load.tilemap('level1', 'nowamapa.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset1', 'assets2/tileset.png');
    game.load.image('tileset2', 'assets2/coin.png');
    game.load.image('tileset3', 'assets2/coin.png');
    //game.load.image('player', 'assets2/player.png');
    game.load.spritesheet('player', 'assets2/player2.png', 20, 20);
    //game.load.image('bullet', 'assets2/bullet.png');
    game.load.image('bullet', 'assets/games/tanks/bullet.png');
    game.load.image('wallV', 'assets2/wallVertical.png');
    game.load.image('wallH', 'assets2/wallHorizontal.png');
    //game.load.image('kolizyjnyImg', 'assets2/enemyBlockTile.png');
    game.load.image('kolizyjnyImg', 'assets2/enemyBlockTile.png');
    game.load.spritesheet('coin', 'assets2/coin.png', 32, 32);
    game.load.image('enemy', 'assets2/enemy.png');
}

function create() {
    //Game
    game.stage.backgroundColor='#3498db';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    map=game.add.tilemap('level1');
    map.addTilesetImage('tileset1');
    map.addTilesetImage('tileset2');
    map.addTilesetImage('tileset3');
    layer=map.createLayer('backgroundlayer');
    enemylayer=map.createLayer('enemylayer'); 
    enemylayer.visible = false;
    //resizes the game world to match the layer dimensions
    layer.resizeWorld();
    game.physics.setBoundsToWorld();
    //Swiat
    createWorld();
    //Gracz
    player=game.add.sprite(22, 50, 'player');
    game.physics.arcade.enable(player); //Fizyka
    player.body.gravity.y=500; //Grawitacja
    player.checkWorldBounds=true;
    player.outOfBoundsKill=true;
    cursor=game.input.keyboard.createCursorKeys(); //Sterowanie strzalkami(kursorami)
    //-Animacja gracza
    player.animations.add('leftAnim', [3, 4], 6, true);
    player.animations.add('rightAnim', [1, 2], 6, true);
    game.camera.follow(player);
    
    map.setCollision(player, true, layer);
    //setCollision(bullet, true, layer);
    map.setCollision(player, true, objectlayer);
    
    //Strzal
    fireButton=game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    nextFireTime=game.time.now;
}

function createWorld() {
    //coins = game.add.group();
    coins = [];
    enemies=[];
    map.objects['objectlayer'].forEach(function(element) {
        // Wrogowie - dodawanie do tablicy obiektow enemies     
        if (element.properties.sprite==='enemy') {
            enemies.push(new Enemy(element.x, element.y));
        }
        //Monety - dodawanie do grupy coins
        else if (element.properties.sprite==='coin') {
            //game.add.sprite(element.x, element.y - 32, 'coin', 0, coins);
            coins.push(new Coin(element.x, element.y));
        }
    }
    );
    //Monety wlasciwosci
    /*
    coins.enableBody=true;
    coins.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5], 10, true);
    coins.callAll('animations.play', 'animations', 'spin');
    */
    
    
    map.setCollisionBetween(1, 2000, true, 'backgroundlayer');
    map.setCollisionBetween(1, 2000, true, 'enemylayer');
    map.setCollision(player,true,coins);
    
}

function update() {
    if (player.alive) {
        game.physics.arcade.collide(player, layer);

        for (var i=0; i < coins.length; i++) {
            game.physics.arcade.collide(player,coins[i].coin, dodajPunkt);
        }

        if (bullet !=null && bullet.alive) 
        {
            
            game.physics.arcade.collide(bullet, layer, destroyBullet);
        }
        
        
        for (var i=0; i < enemies.length; i++) {
            game.physics.arcade.collide(enemies[i].enemy, layer);
            for (var j=0;j < enemies.length;j++) {
                if (j !=i) game.physics.arcade.collide(enemies[i].enemy, enemies[j].enemy);
            }
            game.physics.arcade.collide(enemies[i].enemy, enemylayer);
            game.physics.arcade.collide(enemies[i].enemy, player, zabijGracza);
            //game.physics.arcade.collide(enemies[i].enemy, collisionTiles);
            //game.physics.arcade.collide(enemies[i].enemy, bullet,zabijWroga);
            if (bullet !=null) game.physics.arcade.collide(bullet, enemies[i].enemy, zabijWroga);
        }
        
        movePlayer(); //Funkcja od sterowania gracza
        if (fireButton.isDown) {
            strzal();
        }
    }
    else {
        koniecGry();
    }
}

function destroyBullet()
{
    console.log('usuwam bullet');
    if(bullet!=null)
        bullet.destroy();
}

function koniecGry(stringX) {
    koniecGryString=stringX;
    //game.physics.arcade.isPaused = true;
    console.log('koniec');
}

function zabijGracza(enemy, player) {
    if (player !=null && player.alive) {
        player.kill();
    }
    else {
        console.log("Gracz juz nie zyje");
    }
    koniecGry('Przegrales');
}

function zabijWroga(enemy, bullet) {
    points++;
    enemy.kill(); //Kill nie usuwa z pamieci
    bullet.destroy();
    var allDead=true;
    for (i=0; i < enemies.length; i++) {
        if (enemies[i].enemy.alive) {
            allDead=false;
        }
    }
    if (allDead==true) {
        koniecGry('Wygrales! Twoj wynik to ' + points + ' punktów');
    }
}

//Dodaje pkt oraz usuwa monete
function dodajPunkt(player, coins) {
    console.log('dodaje punkt');
    points++;
    coins.kill();
    
}

//Obecnie mozliwosc wystrzalu jednego pocisku, opoznienie odopwiednie tak aby wystrzelony wczesniej przycisk wylecial 
//albo poza krawedzie i zostal automatycznie zniszczony albo zniszoczny przy uderzeniu w przeciwnika albo przy kolizji z layer(platformy)
function strzal() {
    if (nextFireTime < game.time.now) {
        if(player)
        bullet = game.add.sprite(player.x, player.y, 'bullet');
        game.physics.arcade.enable(bullet); //Fizyka
        bullet.checkWorldBounds=true;
        bullet.outOfBoundsKill=true;
        if (playerDirection==0) {
            bullet.scale.x=-1;
            bullet.body.velocity.x=-300;
        }
        else if (playerDirection==1) {
            bullet.scale.x=1;
            bullet.body.velocity.x=300;
        }
        nextFireTime=game.time.now + 1000;

    }
}

function movePlayer() {
    if (cursor.up.isDown && player.body.onFloor()) { // zmienilem tutaj na inna metode
        player.body.velocity.y=-320;
    }
    else if (cursor.left.isDown) {
        player.body.velocity.x=-200;
        player.animations.play('leftAnim');
        playerDirection=0;
    }
    else if (cursor.right.isDown) {
        player.body.velocity.x=200;
        player.animations.play('rightAnim');
        playerDirection=1;
    }
    else {
        player.animations.stop();
        player.body.velocity.x=0;
    }
}

function render() {
    game.debug.bodyInfo(player, 10, 10); //Wyswietla info o graczu, pozycja itp
    //game.debug.body(player); //Zaznacza obiekt debugowany na zielony
    //Wyswietlanie liczby pktow
    game.debug.text('Punkty: ' + points, 0, 330);
    game.debug.text('Kierunek: ' + playerDirection, 0, 300);
    if (koniecGryString.length > 0) game.debug.text(koniecGryString, game.world.centerX - 100, game.world.centerY);
    if (bullet !=null && bullet.alive) game.debug.text('Bullet: alive', 0, 270);
    else game.debug.text('Bullet: null', 0, 270);
    
}