let html = `<div class="speedtest">
    <div class="speedtest__body">
        <svg viewBox="-250 -250 500 305" width="100%">
            <g class="scale">
                <circle r="200" fill="none" stroke-width="15" class="speedtest__progress" id="speedtest_progress"></circle>
                <circle r="200" fill="none" stroke-width="5" stroke="currentColor" class="speedtest__frequency"></circle>
                <circle r="200" fill="none" stroke-width="10" class="speedtest__fill"></circle>
            </g>
        
            <path d="m-220 0 a120 -120 0 0 1 440 0" fill="none" stroke="blue" stroke-width="0" id="speedtest_path"></path>
        
            <text font-size="20px" x="30">
                <textpath href="#speedtest_path" data-text="5">5</textpath>
            </text>
            <text font-size="20px" x="105">
                <textpath href="#speedtest_path" data-text="10">10</textpath>
            </text>
            <text font-size="20px" x="185">
                <textpath href="#speedtest_path" data-text="15">15</textpath>
            </text>
            <text font-size="20px" x="250">
                <textpath href="#speedtest_path" data-text="20">20</textpath>
            </text>
            <text font-size="20px" x="330">
                <textpath href="#speedtest_path" data-text="30">30</textpath>
            </text>
            <text font-size="20px" x="410">
                <textpath href="#speedtest_path" data-text="60">60</textpath>
            </text>
            <text font-size="20px" x="485">
                <textpath href="#speedtest_path" data-text="100">100</textpath>
            </text>
            <text font-size="20px" x="560">
                <textpath href="#speedtest_path" data-text="200">200</textpath>
            </text>
            <text font-size="20px" x="635">
                <textpath href="#speedtest_path" data-text="500">500</textpath>
            </text>
        
            <text id="speedtest_num" text-anchor="middle" alignment-baseline="central" y="-80" font-size="70">0.000</text>
            <text id="speedtest_num-text" text-anchor="middle" alignment-baseline="central" y="-20" font-size="25">Mbps</text>
            <text id="speedtest_status" text-anchor="middle" alignment-baseline="central" y="35" font-size="20"></text>
        </svg>

        <svg viewBox="-250 -300 500 55" width="100%">
            <polyline id="speedtest_graph" points="-250,-250" stroke="currentColor" stroke-width="2" fill="none"></polyline>
        </svg>
    </div>
</div>`

export default html