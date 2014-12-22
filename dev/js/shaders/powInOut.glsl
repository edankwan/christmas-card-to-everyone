float powInOut(float t, float p) {
    return (1.-step(.5, t))*pow(t*2.,p)*.5+step(.5,t)*(1.-pow((1.-t)*2.,p)*.5);
}
