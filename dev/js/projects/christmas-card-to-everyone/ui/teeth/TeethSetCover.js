define([
        'settings',
        'PIXI',
        '2d/stage2d',
        'mout/object/mixIn',
        'mout/math/clamp',
        'utils/mathUtils',
        './Tooth',
        './TeethSetCoverPervertShader',
        'stageReference'
    ],
    function(settings, PIXI, stage2d, mixIn, clamp, mathUtils, Tooth, TeethSetCoverPervertShader, stageReference) {

        function TeethSetCover() {}

        TeethSetCover.canvas = null;

        var _super = PIXI.Strip.prototype;
        var _p = TeethSetCover.prototype = Object.create( _super );
        _p.constructor = TeethSetCover;

        var GUM_HEIGHT = TeethSetCover.GUM_HEIGHT = 12;
        var WHITE_HEIGHT = TeethSetCover.WHITE_HEIGHT = 44;
        var GUM_COLOR = TeethSetCover.GUM_COLOR = 0xf15454;
        var BASE_COLOR = TeethSetCover.BASE_COLOR = 0xe83737;

        function __drawTeethShape() {
            if(!TeethSetCover.toothTexture) {
                var TOOTH_DISTANCE = Tooth.DISTANCE;
                var TOOTH_TEXTURE_SCALE = Tooth.TEXTURE_SCALE;
                var canvas = document.createElement('canvas');
                canvas.width = TOOTH_DISTANCE * TOOTH_TEXTURE_SCALE;
                canvas.height = TOOTH_DISTANCE * TOOTH_TEXTURE_SCALE;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(Tooth.toothCanvas, 0, 0);
                ctx.scale(TOOTH_TEXTURE_SCALE, TOOTH_TEXTURE_SCALE);
                ctx.fillStyle = '#' + (BASE_COLOR).toString(16);
                ctx.fillRect(0, WHITE_HEIGHT, TOOTH_DISTANCE, TOOTH_DISTANCE - WHITE_HEIGHT);
                ctx.fillStyle = '#' + (GUM_COLOR).toString(16);
                ctx.fillRect(0, WHITE_HEIGHT, TOOTH_DISTANCE, GUM_HEIGHT);

                TeethSetCover.toothTexture = new PIXI.Texture(new PIXI.BaseTexture(canvas));

                stage2d.renderer.shaderManager.teethSetCoverPervertShader = new TeethSetCoverPervertShader(stage2d.renderer.gl);

            }
        }

        function init(cfg) {

            __drawTeethShape();

            mixIn(this, {
                colorRatio: 0,
                direction: 1
            }, cfg);

            _super.constructor.call(this, TeethSetCover.toothTexture);

            this.refresh(0, 0);
        }


        // base on Pixi.Rope
        // TODO not use Strip as reference because it is not using TRIANGLE_STRIP anymore
        function refresh(width, height) {
            var TOOTH_DISTANCE = Tooth.DISTANCE;
            var segX = this.segX = Math.ceil(width / TOOTH_DISTANCE) + 1;
            var segX1 = this.segX1 = segX + 1;
            var segY = this.segY = 3;
            var segY1 = this.segY1 = segY + 1;

            this.vertices = new PIXI.Float32Array(segX1 * segY1 * 2);
            this.originalVerticies = new PIXI.Float32Array(segX1 * segY1 * 2);
            this.uvs = new PIXI.Float32Array(segX1 * segY1 * 2);
            this.indices = new PIXI.Uint16Array(segX * 18);

            var vertices = this.vertices;
            var originalVerticies = this.originalVerticies;
            var uvs = this.uvs;
            var indices = this.indices;
            var i, j, x, x1;

            var index = 0;
            var baseX = this.baseX = (width - (segX - 1) * Tooth.DISTANCE) / 2;
            var baseY = -TOOTH_DISTANCE;
            var containerHeight = this.containerHeight = height + TOOTH_DISTANCE;

            for ( i = 0; i < segX1; i ++ ) {

                x = baseX + i * TOOTH_DISTANCE;

                vertices[index+0] = x;
                vertices[index+1] = baseY;
                vertices[index+2] = x;
                vertices[index+3] = baseY + WHITE_HEIGHT;
                vertices[index+4] = x;
                vertices[index+5] = baseY + WHITE_HEIGHT + GUM_HEIGHT;
                vertices[index+6] = x;
                vertices[index+7] = containerHeight;

                uvs[index + 0] = i & 1;
                uvs[index + 1] = 0;
                uvs[index + 2] = i & 1;
                uvs[index + 3] = WHITE_HEIGHT / TOOTH_DISTANCE;
                uvs[index + 4] = i & 1;
                uvs[index + 5] = (WHITE_HEIGHT + GUM_HEIGHT) / TOOTH_DISTANCE;
                uvs[index + 6] = i & 1;
                uvs[index + 7] = 1;

                index += segY1 * 2;
            }
            if(this.direction < 0) {
                for ( i = 1, j = vertices.length; i < j; i += 2 ) {
                    vertices[i] *= -1;
                }
            }
            for ( i = 0, j = originalVerticies.length; i < j; i ++ ) {
                originalVerticies[i] = vertices[i];
            }

            index = 0;

            for ( i = 0; i < segX; i ++ ) {

                for ( j = 0; j < segY; j ++ ) {

                    var topLeft = i * segY1 + j;
                    var topRight = (i + 1) * segY1 + j;
                    var bottomLeft = i * segY1 + j + 1;
                    var bottomRight = (i + 1) * segY1 + j + 1;

                    indices[index + 0] = topLeft;
                    indices[index + 1] = topRight;
                    indices[index + 2] = bottomLeft;
                    indices[index + 3] = bottomLeft;
                    indices[index + 4] = topRight;
                    indices[index + 5] = bottomRight;
                    index += 6;
                }
            }

            this.dirty = true;

        }

        _p._renderStrip = function(renderSession){
            var gl = renderSession.gl;
            var projection = renderSession.projection,
                offset = renderSession.offset,
                shader = renderSession.shaderManager.teethSetCoverPervertShader;
            // gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mat4Real);

            renderSession.blendModeManager.setBlendMode(this.blendMode);

            // set uniforms
            gl.uniformMatrix3fv(shader.translationMatrix, false, this.worldTransform.toArray(true));
            gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
            gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
            gl.uniform1f(shader.alpha, this.worldAlpha);

            gl.uniform1f(shader.ulColorRatio, settings.pervertMode ? this.colorRatio : 0);

            if(!this.dirty) {

                gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
                gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

                // update the uvs
                gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
                gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

                gl.activeTexture(gl.TEXTURE0);

                // check if a texture is dirty..
                if(this.texture.baseTexture._dirty[gl.id])
                {
                    renderSession.renderer.updateTexture(this.texture.baseTexture);
                }
                else
                {
                    // bind the current texture
                    gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id]);
                }

                // dont need to upload!
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);


            } else {

                this.dirty = false;
                gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
                gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

                // update the uvs
                gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
                gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

                gl.activeTexture(gl.TEXTURE0);

                // check if a texture is dirty..
                if(this.texture.baseTexture._dirty[gl.id]) {
                    renderSession.renderer.updateTexture(this.texture.baseTexture);
                } else {
                    gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id]);
                }

                // dont need to upload!
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

            }
            //console.log(gl.TRIANGLE_STRIP)
            //
            //

            // use TRIANGLES

            gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);


        };

        function _renderWebGL(renderSession) {
            // if the sprite is not visible or the alpha is 0 then no need to render this element
            if(!this.visible || this.alpha <= 0)return;
            // render triangle strip..

            renderSession.spriteBatch.stop();

            // init! init!
            if(!this._vertexBuffer)this._initWebGL(renderSession);

            renderSession.shaderManager.setShader(renderSession.shaderManager.teethSetCoverPervertShader);

            this._renderStrip(renderSession);

            ///renderSession.shaderManager.activateDefaultShader();

            renderSession.spriteBatch.start();

            //TODO check culling
        }


        function update(openRatio, showTeethRatio, mouseDownRatio, mouseDragRatio) {

            this.colorRatio = mouseDownRatio * (1 - openRatio);

            var TOOTH_DISTANCE = Tooth.DISTANCE;
            var segX = this.segX;
            var segX1 = this.segX1;
            var centerXRatio, index;
            var containerHeight = this.containerHeight;
            var vertices = this.vertices;
            var originalVerticies = this.originalVerticies;
            var baseX = this.baseX;
            var baseY = -TOOTH_DISTANCE;
            var x;
            var reversedShowTeethRatio = (1 - showTeethRatio) * this.direction;
            var reversedOpenRatio = 1 - openRatio;
            var dragContainerHeight = containerHeight  * this.direction;
            var dragHeight, ratio;
            var dragRatio = (showTeethRatio * 0.03 + mouseDownRatio * 0.07 + (mouseDragRatio * mouseDownRatio) * 0.9) * (mathUtils.clampNorm(reversedOpenRatio,0, 0.3));

            for(var i = 0; i < segX1; i++) {
                x = baseX + i * TOOTH_DISTANCE;
                centerXRatio = i / segX;
                dragHeight = (1+Math.cos(clamp((centerXRatio - 0.5) * (6 - Math.pow(dragRatio,1.5) * 5) * reversedOpenRatio, -1, 1) * Math.PI)) / 2 * dragRatio * dragContainerHeight * 0.7;
                index = i * 8;
                vertices[index+1] = originalVerticies[index+1] + dragHeight;
                vertices[index+3] = originalVerticies[index+3] - reversedShowTeethRatio * WHITE_HEIGHT + dragHeight;
                vertices[index+5] = originalVerticies[index+5] - reversedShowTeethRatio * (WHITE_HEIGHT + GUM_HEIGHT) + dragHeight;
            }
        }

        _p.refresh = refresh;
        _p.init = init;
        _p.update = update;
        _p._renderWebGL = _renderWebGL;

        return TeethSetCover;
    }
);
